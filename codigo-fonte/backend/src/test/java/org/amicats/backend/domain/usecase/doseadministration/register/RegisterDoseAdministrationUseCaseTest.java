package org.amicats.backend.domain.usecase.doseadministration.register;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.time.*;
import java.util.Optional;
import java.util.UUID;
import org.amicats.backend.domain.entity.*;
import org.amicats.backend.domain.enums.*;
import org.amicats.backend.domain.interfaces.dataprovider.doseadministration.DoseAdministrationDataProvider;
import org.amicats.backend.domain.interfaces.dataprovider.stock.StockConsumptionDataProvider;
import org.amicats.backend.domain.interfaces.dataprovider.stock.StockItemDataProvider;
import org.amicats.backend.domain.interfaces.dataprovider.user.UserDataProvider;
import org.amicats.backend.exception.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.junit.jupiter.params.provider.NullSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class RegisterDoseAdministrationUseCaseTest {
  private static final LocalDateTime NOW = LocalDateTime.of(2026, 10, 5, 12, 0);
  private static final UUID OPERATION = UUID.fromString("6406ca75-0bdc-4ffc-a60b-c73cb136a5d8");

  @Mock private DoseAdministrationDataProvider doses;
  @Mock private UserDataProvider users;
  @Mock private StockItemDataProvider stocks;
  @Mock private StockConsumptionDataProvider consumptions;
  private RegisterDoseAdministrationUseCase useCase;
  private User user;
  private PrescribedMedication medication;

  @BeforeEach
  void setUp() {
    user = user(AccessType.Assistant);
    when(users.findById(7)).thenReturn(Optional.of(user));
    medication = medication(10);
    useCase =
        RegisterDoseAdministrationUseCase.builder()
            .doseAdministrationDataProvider(doses)
            .userDataProvider(users)
            .stockItemDataProvider(stocks)
            .stockConsumptionDataProvider(consumptions)
            .clock(Clock.fixed(NOW.toInstant(ZoneOffset.UTC), ZoneOffset.UTC))
            .build();
  }

  @ParameterizedTest
  @EnumSource(
      value = AccessType.class,
      names = {"Administrator", "Veterinarian", "Assistant"})
  void registersForAuthorizedRolesAndSnapshotsPrescription(AccessType role) {
    user = user(role);
    when(users.findById(7)).thenReturn(Optional.of(user));
    givenMedication();
    givenStock();
    when(doses.insertIfAbsent(any()))
        .thenAnswer(
            invocation -> {
              DoseAdministration dose = invocation.getArgument(0);
              ReflectionTestUtils.setField(dose, "id", 90);
              return new DoseAdministrationDataProvider.InsertResult(dose, true);
            });

    var result = useCase.execute(10, 7, input(NOW.minusHours(1), " Aplicada. "));

    assertThat(result.created()).isTrue();
    assertThat(result.dose().id()).isEqualTo(90);
    assertThat(result.dose().administeredById()).isEqualTo(7);
    assertThat(result.dose().recordedAt()).isEqualTo(NOW);
    assertThat(result.dose().administeredAt()).isEqualTo(NOW.minusHours(1));
    assertThat(result.dose().dosage()).isEqualTo("dose de teste");
    assertThat(result.dose().route()).isEqualTo(AdministrationRoute.Oral);
    assertThat(result.dose().notes()).isEqualTo("Aplicada.");
    assertThat(medication.getMedication().getQuantity()).isEqualByComparingTo("9");
    assertThat(result.dose().stockBalanceAfter()).isEqualByComparingTo("9");
    verify(consumptions).save(any(StockConsumption.class));
  }

  @Test
  void rejectsViewer() {
    when(users.findById(7)).thenReturn(Optional.of(user(AccessType.Viewer)));
    assertThatThrownBy(() -> useCase.execute(10, 7, input(NOW, null)))
        .isInstanceOf(DoseAdministrationAccessException.class);
    verifyNoInteractions(doses);
  }

  @Test
  void rejectsInactiveUser() {
    user.deactivate();
    assertThatThrownBy(() -> useCase.execute(10, 7, input(NOW, null)))
        .isInstanceOf(DoseAdministrationAccessException.class);
    verifyNoInteractions(doses);
  }

  @Test
  void rejectsUnknownUser() {
    when(users.findById(7)).thenReturn(Optional.empty());
    assertThatThrownBy(() -> useCase.execute(10, 7, input(NOW, null)))
        .isInstanceOf(DoseAdministrationAccessException.class);
    verifyNoInteractions(doses);
  }

  @Test
  void rejectsMissingInput() {
    assertThatThrownBy(() -> useCase.execute(10, 7, null))
        .isInstanceOf(InvalidDoseAdministrationException.class);
  }

  @Test
  void rejectsUnknownMedication() {
    assertThatThrownBy(() -> useCase.execute(10, 7, input(NOW, null)))
        .isInstanceOf(ResourceNotFoundException.class);
    verify(doses, never()).insertIfAbsent(any());
  }

  @Test
  void rejectsFutureApplication() {
    givenMedication();
    assertThatThrownBy(() -> useCase.execute(10, 7, input(NOW.plusMinutes(5).plusSeconds(1), null)))
        .isInstanceOf(InvalidDoseAdministrationException.class);
    verify(doses, never()).insertIfAbsent(any());
  }

  @Test
  void rejectsApplicationBeforePrescriptionCreation() {
    givenMedication();
    assertThatThrownBy(
            () -> useCase.execute(10, 7, input(LocalDateTime.of(2026, 10, 1, 7, 59), null)))
        .isInstanceOf(InvalidDoseAdministrationException.class);
  }

  @Test
  void rejectsApplicationBeforeTreatmentStarts() {
    ReflectionTestUtils.setField(medication, "startDate", NOW.toLocalDate());
    givenMedication();
    assertThatThrownBy(() -> useCase.execute(10, 7, input(NOW.minusDays(1), null)))
        .isInstanceOf(InvalidDoseAdministrationException.class);
  }

  @Test
  void rejectsApplicationAfterTreatmentEnds() {
    ReflectionTestUtils.setField(medication, "endDate", NOW.toLocalDate().minusDays(1));
    givenMedication();
    assertThatThrownBy(() -> useCase.execute(10, 7, input(NOW, null)))
        .isInstanceOf(InvalidDoseAdministrationException.class);
  }

  @Test
  void acceptsLateSynchronizationOfACompletedTreatment() {
    ReflectionTestUtils.setField(medication, "endDate", NOW.toLocalDate().minusDays(1));
    ReflectionTestUtils.setField(medication, "status", PrescribedMedicationStatus.Completed);
    givenSuccessfulInsert();
    var result = useCase.execute(10, 7, input(NOW.minusDays(1), null));
    assertThat(result.created()).isTrue();
  }

  @Test
  void acceptsApplicationBeforeCancellationEvenWhenSynchronizedLater() {
    medication.cancel(user, "Teste", NOW.minusHours(1));
    givenSuccessfulInsert();
    assertThat(useCase.execute(10, 7, input(NOW.minusHours(2), null)).created()).isTrue();
  }

  @Test
  void rejectsApplicationAtOrAfterCancellation() {
    medication.cancel(user, "Teste", NOW.minusHours(1));
    givenMedication();
    assertThatThrownBy(() -> useCase.execute(10, 7, input(NOW.minusHours(1), null)))
        .isInstanceOf(DoseAdministrationConflictException.class);
    assertThatThrownBy(() -> useCase.execute(10, 7, input(NOW, null)))
        .isInstanceOf(DoseAdministrationConflictException.class);
    verify(doses, never()).insertIfAbsent(any());
  }

  @Test
  void returnsExistingRecordWithoutRevalidatingDatesOrInserting() {
    DoseAdministration existing = dose();
    medication.cancel(user, "Teste", NOW.minusHours(1));
    when(doses.findByClientOperationId(OPERATION)).thenReturn(Optional.of(existing));

    assertThat(useCase.execute(10, 7, input(NOW.minusHours(2), null)).created()).isFalse();
    verify(doses, never()).findMedicationForUpdate(any());
    verify(doses, never()).insertIfAbsent(any());
  }

  @Test
  void rejectsSameOperationWithChangedPayload() {
    when(doses.findByClientOperationId(OPERATION)).thenReturn(Optional.of(dose()));
    assertThatThrownBy(() -> useCase.execute(10, 7, input(NOW.minusHours(2), "Mudou")))
        .isInstanceOf(DoseAdministrationConflictException.class);
    assertThatThrownBy(() -> useCase.execute(11, 7, input(NOW.minusHours(2), null)))
        .isInstanceOf(DoseAdministrationConflictException.class);
    assertThatThrownBy(() -> useCase.execute(10, 7, input(NOW.minusHours(3), null)))
        .isInstanceOf(DoseAdministrationConflictException.class);
    verify(doses, never()).insertIfAbsent(any());
  }

  @Test
  void handlesAReplayThatArrivesWhileWaitingForTheMedicationLock() {
    when(doses.findByClientOperationId(OPERATION))
        .thenReturn(Optional.empty(), Optional.of(dose()));
    givenMedication();
    assertThat(useCase.execute(10, 7, input(NOW.minusHours(2), null)).created()).isFalse();
    verify(doses, never()).insertIfAbsent(any());
  }

  @Test
  void handlesTheDatabaseReturningAnAlreadyInsertedOperation() {
    givenMedication();
    givenStock();
    when(doses.insertIfAbsent(any()))
        .thenReturn(new DoseAdministrationDataProvider.InsertResult(dose(), false));
    assertThat(useCase.execute(10, 7, input(NOW.minusHours(2), null)).created()).isFalse();
  }

  @Test
  void rejectsARacingOperationForAnotherMedication() {
    givenMedication();
    givenStock();
    DoseAdministration another =
        DoseAdministration.register(
            medication(11),
            user,
            OPERATION,
            NOW.minusHours(2),
            NOW,
            null,
            DoseRegistrationOrigin.OfflineSynced);
    when(doses.insertIfAbsent(any()))
        .thenReturn(new DoseAdministrationDataProvider.InsertResult(another, false));
    assertThatThrownBy(() -> useCase.execute(10, 7, input(NOW.minusHours(2), null)))
        .isInstanceOf(DoseAdministrationConflictException.class);
  }

  @Test
  void consumesFractionalQuantity() {
    givenSuccessfulInsert();
    var input =
        new RegisterDoseAdministrationInput(
            OPERATION, NOW, null, DoseRegistrationOrigin.Online, new BigDecimal("0.5"), "unidade");
    var result = useCase.execute(10, 7, input);
    assertThat(result.dose().stockBalanceAfter()).isEqualByComparingTo("9.5");
    assertThat(medication.getMedication().getQuantity()).isEqualByComparingTo("9.5");
  }

  @Test
  void preservesTheApplicationAndFlagsNegativeStock() {
    givenSuccessfulInsert();
    var input =
        new RegisterDoseAdministrationInput(
            OPERATION,
            NOW,
            null,
            DoseRegistrationOrigin.OfflineSynced,
            new BigDecimal("12"),
            "unidade");
    var result = useCase.execute(10, 7, input);
    assertThat(result.dose().stockBalanceAfter()).isEqualByComparingTo("-2");
    assertThat(result.dose().stockDivergenceAtRegistration()).isTrue();
  }

  @Test
  void rejectsIncompatibleUnitsBeforeAnyInsertOrDebit() {
    givenMedication();
    givenStock();
    var input =
        new RegisterDoseAdministrationInput(
            OPERATION, NOW, null, DoseRegistrationOrigin.Online, BigDecimal.ONE, "ml");
    assertThatThrownBy(() -> useCase.execute(10, 7, input))
        .isInstanceOf(InvalidStockConsumptionException.class);
    verify(doses, never()).insertIfAbsent(any());
    verifyNoInteractions(consumptions);
  }

  @Test
  void replayDoesNotDebitStockAgain() {
    when(doses.findByClientOperationId(OPERATION)).thenReturn(Optional.of(dose()));
    useCase.execute(10, 7, input(NOW.minusHours(2), null));
    assertThat(medication.getMedication().getQuantity()).isEqualByComparingTo("10");
    verify(stocks, never()).save(any());
    verifyNoInteractions(consumptions);
  }

  @Test
  void reusedOperationWithChangedConsumptionReturnsConflict() {
    when(doses.findByClientOperationId(OPERATION)).thenReturn(Optional.of(dose()));
    var changed =
        new RegisterDoseAdministrationInput(
            OPERATION,
            NOW.minusHours(2),
            null,
            DoseRegistrationOrigin.OfflineSynced,
            new BigDecimal("2"),
            "unidade");
    assertThatThrownBy(() -> useCase.execute(10, 7, changed))
        .isInstanceOf(DoseAdministrationConflictException.class);
    verifyNoInteractions(consumptions);
  }

  @Test
  void acceptsFiveMinuteSkewAndUsesUtcEvenWithAnotherClockZone() {
    useCase =
        RegisterDoseAdministrationUseCase.builder()
            .doseAdministrationDataProvider(doses)
            .userDataProvider(users)
            .stockItemDataProvider(stocks)
            .stockConsumptionDataProvider(consumptions)
            .clock(Clock.fixed(NOW.toInstant(ZoneOffset.UTC), ZoneId.of("America/Sao_Paulo")))
            .build();
    givenSuccessfulInsert();
    var result = useCase.execute(10, 7, input(NOW.plusMinutes(5), null));
    assertThat(result.dose().recordedAt()).isEqualTo(NOW);
    assertThat(medication.getMedication().getQuantity()).isEqualByComparingTo("9");
  }

  @Test
  void legacyReplayDoesNotCreateRetrospectiveStockConsumption() {
    var historical =
        DoseAdministration.register(
            medication,
            user,
            OPERATION,
            NOW.minusHours(2),
            NOW,
            null,
            DoseRegistrationOrigin.OfflineSynced);
    when(doses.findByClientOperationId(OPERATION)).thenReturn(Optional.of(historical));
    var result =
        useCase.execute(
            10,
            7,
            new RegisterDoseAdministrationInput(
                OPERATION,
                NOW.minusHours(2),
                null,
                DoseRegistrationOrigin.OfflineSynced,
                null,
                null));
    assertThat(result.created()).isFalse();
    assertThat(result.dose().consumedQuantity()).isNull();
    verifyNoInteractions(stocks, consumptions);
  }

  @ParameterizedTest
  @NullSource
  @ValueSource(strings = {"0", "-1", "0.0001", "1000000000"})
  void rejectsInvalidConsumptionWithoutWriting(String value) {
    givenMedication();
    givenStock();
    var quantity = value == null ? null : new BigDecimal(value);
    assertThatThrownBy(
            () ->
                useCase.execute(
                    10,
                    7,
                    new RegisterDoseAdministrationInput(
                        OPERATION,
                        NOW,
                        null,
                        DoseRegistrationOrigin.OfflineSynced,
                        quantity,
                        "unidade")))
        .isInstanceOf(InvalidStockConsumptionException.class);
    verify(doses, never()).insertIfAbsent(any());
    verify(stocks, never()).save(any());
    verifyNoInteractions(consumptions);
  }

  private void givenStock() {
    when(stocks.findByIdForUpdate(5)).thenReturn(Optional.of(medication.getMedication()));
  }

  private void givenMedication() {
    when(doses.findMedicationForUpdate(10)).thenReturn(Optional.of(medication));
  }

  private void givenSuccessfulInsert() {
    givenMedication();
    givenStock();
    when(doses.insertIfAbsent(any()))
        .thenAnswer(
            invocation ->
                new DoseAdministrationDataProvider.InsertResult(invocation.getArgument(0), true));
  }

  private DoseAdministration dose() {
    var dose =
        DoseAdministration.register(
            medication,
            user,
            OPERATION,
            NOW.minusHours(2),
            NOW,
            null,
            DoseRegistrationOrigin.OfflineSynced);
    dose.prepareConsumption(medication.getMedication(), BigDecimal.ONE, "unidade");
    return dose;
  }

  private RegisterDoseAdministrationInput input(LocalDateTime applied, String notes) {
    return new RegisterDoseAdministrationInput(
        OPERATION, applied, notes, DoseRegistrationOrigin.OfflineSynced, BigDecimal.ONE, "unidade");
  }

  private User user(AccessType role) {
    User user = new User("Responsável", null, null, role, null, null, NOW.minusDays(10));
    ReflectionTestUtils.setField(user, "id", 7);
    return user;
  }

  private PrescribedMedication medication(Integer id) {
    Cat cat = mock(Cat.class);
    lenient().when(cat.getId()).thenReturn(3);
    StockItem stock =
        new StockItem("Medicamento de teste", "Medicamento", BigDecimal.TEN, "unidade", null);
    ReflectionTestUtils.setField(stock, "id", 5);
    LocalDateTime created = LocalDateTime.of(2026, 10, 1, 8, 0);
    InternalMedicalPrescription prescription =
        new InternalMedicalPrescription(cat, user, "Teste", null, true, created);
    PrescribedMedication medication =
        PrescribedMedication.fromInternal(
            prescription,
            stock,
            "dose de teste",
            AdministrationRoute.Oral,
            12,
            7,
            created.toLocalDate(),
            created);
    ReflectionTestUtils.setField(medication, "id", id);
    return medication;
  }
}
