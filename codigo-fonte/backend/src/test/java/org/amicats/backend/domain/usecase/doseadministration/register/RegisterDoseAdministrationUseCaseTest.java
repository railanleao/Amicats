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
import org.amicats.backend.domain.interfaces.dataprovider.user.UserDataProvider;
import org.amicats.backend.exception.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class RegisterDoseAdministrationUseCaseTest {
  private static final LocalDateTime NOW = LocalDateTime.of(2026, 10, 5, 12, 0);
  private static final UUID OPERATION = UUID.fromString("6406ca75-0bdc-4ffc-a60b-c73cb136a5d8");

  @Mock private DoseAdministrationDataProvider doses;
  @Mock private UserDataProvider users;
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
  void rejectsApplicationBeyondFutureTolerance() {
    givenMedication();
    assertThatThrownBy(
            () -> useCase.execute(10, 7, input(NOW.plusMinutes(5).plusNanos(1000), null)))
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
    when(doses.insertIfAbsent(any()))
        .thenReturn(new DoseAdministrationDataProvider.InsertResult(dose(), false));
    assertThat(useCase.execute(10, 7, input(NOW.minusHours(2), null)).created()).isFalse();
  }

  @Test
  void rejectsARacingOperationForAnotherMedication() {
    givenMedication();
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
  void recordsUtcEvenIfTheInjectedClockHasAnotherZone() {
    useCase =
        RegisterDoseAdministrationUseCase.builder()
            .doseAdministrationDataProvider(doses)
            .userDataProvider(users)
            .clock(Clock.fixed(NOW.toInstant(ZoneOffset.UTC), ZoneId.of("Pacific/Honolulu")))
            .build();
    givenSuccessfulInsert();
    var result = useCase.execute(10, 7, input(NOW.minusMinutes(1), null));
    assertThat(result.dose().recordedAt()).isEqualTo(NOW);
  }

  private void givenMedication() {
    when(doses.findMedicationForUpdate(10)).thenReturn(Optional.of(medication));
  }

  private void givenSuccessfulInsert() {
    givenMedication();
    when(doses.insertIfAbsent(any()))
        .thenAnswer(
            invocation ->
                new DoseAdministrationDataProvider.InsertResult(invocation.getArgument(0), true));
  }

  private DoseAdministration dose() {
    return DoseAdministration.register(
        medication,
        user,
        OPERATION,
        NOW.minusHours(2),
        NOW,
        null,
        DoseRegistrationOrigin.OfflineSynced);
  }

  private RegisterDoseAdministrationInput input(LocalDateTime applied, String notes) {
    return new RegisterDoseAdministrationInput(
        OPERATION, applied, notes, DoseRegistrationOrigin.OfflineSynced);
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
