package org.amicats.backend.domain.usecase.internalmedicalprescription.create;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;
import org.amicats.backend.domain.entity.Cat;
import org.amicats.backend.domain.entity.InternalMedicalPrescription;
import org.amicats.backend.domain.entity.PrescribedMedication;
import org.amicats.backend.domain.entity.StockItem;
import org.amicats.backend.domain.entity.User;
import org.amicats.backend.domain.enums.AccessType;
import org.amicats.backend.domain.enums.AdministrationRoute;
import org.amicats.backend.domain.enums.MedicalPrescriptionOrigin;
import org.amicats.backend.domain.enums.MedicalPrescriptionStatus;
import org.amicats.backend.domain.enums.PrescribedMedicationStatus;
import org.amicats.backend.domain.interfaces.dataprovider.cat.CatDataProvider;
import org.amicats.backend.domain.interfaces.dataprovider.internalmedicalprescription.InternalMedicalPrescriptionDataProvider;
import org.amicats.backend.domain.interfaces.dataprovider.prescribedmedication.PrescribedMedicationDataProvider;
import org.amicats.backend.domain.interfaces.dataprovider.stock.StockItemDataProvider;
import org.amicats.backend.domain.interfaces.dataprovider.user.UserDataProvider;
import org.amicats.backend.domain.usecase.internalmedicalprescription.read.ReadInternalMedicalPrescriptionOutput;
import org.amicats.backend.domain.usecase.prescribedmedication.create.CreatePrescribedMedicationInput;
import org.amicats.backend.domain.usecase.prescribedmedication.create.CreatePrescribedMedicationUseCase;
import org.amicats.backend.exception.ActivePrescribedMedicationConflictException;
import org.amicats.backend.exception.InvalidPrescribedMedicationException;
import org.amicats.backend.exception.VeterinarianRequiredException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class CreateInternalMedicalPrescriptionUseCaseTest {

  private static final Integer CAT_ID = 1;
  private static final Integer VET_ID = 7;
  private static final LocalDate TODAY = LocalDate.of(2026, 9, 30);
  private static final String MEDICATION_CATEGORY = "Medicamento";

  @Mock private CatDataProvider catDataProvider;
  @Mock private UserDataProvider userDataProvider;
  @Mock private StockItemDataProvider stockItemDataProvider;
  @Mock private InternalMedicalPrescriptionDataProvider internalMedicalPrescriptionDataProvider;
  @Mock private PrescribedMedicationDataProvider prescribedMedicationDataProvider;

  private CreateInternalMedicalPrescriptionUseCase useCase;

  @BeforeEach
  void setUp() {
    Clock clock =
        Clock.fixed(Instant.parse("2026-09-30T15:00:00Z"), ZoneId.of("America/Campo_Grande"));

    CreatePrescribedMedicationUseCase createPrescribedMedicationUseCase =
        CreatePrescribedMedicationUseCase.builder()
            .stockItemDataProvider(stockItemDataProvider)
            .prescribedMedicationDataProvider(prescribedMedicationDataProvider)
            .build();

    useCase =
        CreateInternalMedicalPrescriptionUseCase.builder()
            .catDataProvider(catDataProvider)
            .userDataProvider(userDataProvider)
            .internalMedicalPrescriptionDataProvider(internalMedicalPrescriptionDataProvider)
            .createPrescribedMedicationUseCase(createPrescribedMedicationUseCase)
            .clock(clock)
            .build();
  }

  @Test
  void createsOnlyTheConsultationWhenNoMedicationIsPrescribed() {
    givenVeterinarian("12345");
    givenCat();

    ReadInternalMedicalPrescriptionOutput output =
        useCase.execute(
            CAT_ID, VET_ID, new CreateInternalMedicalPrescriptionInput("Reavaliação", " ", null));

    assertThat(output.status()).isEqualTo(MedicalPrescriptionStatus.Completed);
    assertThat(output.medication()).isNull();
    assertThat(output.notes()).isNull();
    assertThat(output.veterinarianCrmv()).isEqualTo("12345");
    verify(internalMedicalPrescriptionDataProvider).save(any(InternalMedicalPrescription.class));
    verifyNoInteractions(prescribedMedicationDataProvider, stockItemDataProvider);
  }

  @Test
  void prescribesAnExistingMedication() {
    givenVeterinarian("12345");
    givenCat();
    when(stockItemDataProvider.findById(5))
        .thenReturn(Optional.of(medication(5, "Interferon felino")));
    when(prescribedMedicationDataProvider.findActiveByCatAndMedication(CAT_ID, 5, TODAY))
        .thenReturn(Optional.empty());

    ReadInternalMedicalPrescriptionOutput output =
        useCase.execute(CAT_ID, VET_ID, input(medicationWithId(5)));

    assertThat(output.status()).isEqualTo(MedicalPrescriptionStatus.InTreatment);
    assertThat(output.medication().origin()).isEqualTo(MedicalPrescriptionOrigin.Internal);
    assertThat(output.medication().stockWarning()).isNull();
    assertThat(output.medication().medicationName()).isEqualTo("Interferon felino");
    assertThat(output.medication().startDate()).isEqualTo(TODAY);
    assertThat(output.medication().endDate()).isEqualTo(LocalDate.of(2026, 12, 28));
    assertThat(output.medication().status()).isEqualTo(PrescribedMedicationStatus.Active);
    verify(stockItemDataProvider, never()).save(any());
  }

  @Test
  void createsTheMedicationInStockWithZeroQuantityAndWarnsAboutIt() {
    givenVeterinarian("12345");
    givenCat();
    when(stockItemDataProvider.findAllByCategory(MEDICATION_CATEGORY))
        .thenReturn(List.of(medication(5, "Interferon felino")));
    when(stockItemDataProvider.save(any(StockItem.class)))
        .thenAnswer(
            invocation -> {
              StockItem saved = invocation.getArgument(0);
              ReflectionTestUtils.setField(saved, "id", 99);
              return saved;
            });

    ReadInternalMedicalPrescriptionOutput output =
        useCase.execute(CAT_ID, VET_ID, input(medicationWithNewName("  Meloxicam   0,2% ", "ml")));

    ArgumentCaptor<StockItem> captor = ArgumentCaptor.forClass(StockItem.class);
    verify(stockItemDataProvider).save(captor.capture());
    StockItem created = captor.getValue();
    assertThat(created.getName()).isEqualTo("Meloxicam 0,2%");
    assertThat(created.getCategory()).isEqualTo(MEDICATION_CATEGORY);
    assertThat(created.getQuantity()).isEqualByComparingTo(BigDecimal.ZERO);
    assertThat(created.getUnit()).isEqualTo("ml");

    assertThat(output.medication().medicationId()).isEqualTo(99);
    assertThat(output.medication().stockWarning())
        .isEqualTo(
            "Meloxicam 0,2% não existia no estoque e foi cadastrado agora, com estoque zerado."
                + " Registre a compra ou doação na tela de Estoque quando o medicamento chegar.");
    verify(prescribedMedicationDataProvider, never())
        .findActiveByCatAndMedication(any(), any(), any());
  }

  @Test
  void reusesTheExistingMedicationWhenTheNameOnlyDiffersInCaseAccentsOrSpaces() {
    givenVeterinarian("12345");
    givenCat();
    when(stockItemDataProvider.findAllByCategory(MEDICATION_CATEGORY))
        .thenReturn(List.of(medication(8, "Amoxicilina")));
    when(prescribedMedicationDataProvider.findActiveByCatAndMedication(CAT_ID, 8, TODAY))
        .thenReturn(Optional.empty());

    ReadInternalMedicalPrescriptionOutput output =
        useCase.execute(CAT_ID, VET_ID, input(medicationWithNewName("  AMOXICILÍNA ", null)));

    assertThat(output.medication().medicationId()).isEqualTo(8);
    assertThat(output.medication().stockWarning()).isNull();
    verify(stockItemDataProvider, never()).save(any());
  }

  @Test
  void blocksWhenTheCatAlreadyHasTheSameMedicationActive() {
    givenVeterinarian("12345");
    givenCat();
    when(stockItemDataProvider.findById(5))
        .thenReturn(Optional.of(medication(5, "Interferon felino")));
    PrescribedMedication active = mock(PrescribedMedication.class);
    when(active.getEndDate()).thenReturn(LocalDate.of(2026, 11, 16));
    when(prescribedMedicationDataProvider.findActiveByCatAndMedication(CAT_ID, 5, TODAY))
        .thenReturn(Optional.of(active));

    assertThatThrownBy(() -> useCase.execute(CAT_ID, VET_ID, input(medicationWithId(5))))
        .isInstanceOf(ActivePrescribedMedicationConflictException.class)
        .hasMessageContaining("Nina já tem Interferon felino ativo até 16/11/2026");

    verify(prescribedMedicationDataProvider, never()).save(any());
  }

  @Test
  void rejectsSendingBothOrNeitherMedicationFields() {
    givenVeterinarian("12345");
    givenCat();
    CreatePrescribedMedicationInput both =
        new CreatePrescribedMedicationInput(
            5, "Meloxicam", null, "0,5 ml", AdministrationRoute.Oral, 24, 5);
    CreatePrescribedMedicationInput neither =
        new CreatePrescribedMedicationInput(
            null, "  ", null, "0,5 ml", AdministrationRoute.Oral, 24, 5);

    assertThatThrownBy(() -> useCase.execute(CAT_ID, VET_ID, input(both)))
        .isInstanceOf(InvalidPrescribedMedicationException.class);
    assertThatThrownBy(() -> useCase.execute(CAT_ID, VET_ID, input(neither)))
        .isInstanceOf(InvalidPrescribedMedicationException.class);
    verify(prescribedMedicationDataProvider, never()).save(any());
  }

  @Test
  void rejectsAStockItemThatIsNotAMedication() {
    givenVeterinarian("12345");
    givenCat();
    StockItem food = new StockItem("Ração renal", "Ração", BigDecimal.TEN, "kg", null);
    ReflectionTestUtils.setField(food, "id", 3);
    when(stockItemDataProvider.findById(3)).thenReturn(Optional.of(food));

    assertThatThrownBy(() -> useCase.execute(CAT_ID, VET_ID, input(medicationWithId(3))))
        .isInstanceOf(InvalidPrescribedMedicationException.class);
  }

  @Test
  void rejectsUsersThatAreNotVeterinarians() {
    User admin = mock(User.class);
    when(admin.getAccessType()).thenReturn(AccessType.Administrator);
    when(userDataProvider.findById(VET_ID)).thenReturn(Optional.of(admin));

    assertThatThrownBy(
            () ->
                useCase.execute(
                    CAT_ID, VET_ID, new CreateInternalMedicalPrescriptionInput("X", null, null)))
        .isInstanceOf(VeterinarianRequiredException.class);
    verifyNoInteractions(catDataProvider, internalMedicalPrescriptionDataProvider);
  }

  @Test
  void rejectsVeterinariansWithoutCrmv() {
    givenVeterinarian(" ");

    assertThatThrownBy(
            () ->
                useCase.execute(
                    CAT_ID, VET_ID, new CreateInternalMedicalPrescriptionInput("X", null, null)))
        .isInstanceOf(VeterinarianRequiredException.class)
        .hasMessageContaining("CRMV");
  }

  private void givenVeterinarian(String crmv) {
    User vet = mock(User.class);
    lenient().when(vet.getAccessType()).thenReturn(AccessType.Veterinarian);
    lenient().when(vet.getCrmv()).thenReturn(crmv);
    lenient().when(vet.getUfCrmv()).thenReturn("MS");
    lenient().when(vet.getFullName()).thenReturn("Dra. Teste");
    when(userDataProvider.findById(VET_ID)).thenReturn(Optional.of(vet));
  }

  private void givenCat() {
    Cat cat = mock(Cat.class);
    lenient().when(cat.getId()).thenReturn(CAT_ID);
    lenient().when(cat.getName()).thenReturn("Nina");
    lenient().when(catDataProvider.findById(CAT_ID)).thenReturn(Optional.of(cat));
  }

  private static StockItem medication(Integer id, String name) {
    StockItem item = new StockItem(name, MEDICATION_CATEGORY, BigDecimal.ONE, "ml", null);
    ReflectionTestUtils.setField(item, "id", id);
    return item;
  }

  private static CreateInternalMedicalPrescriptionInput input(
      CreatePrescribedMedicationInput medication) {
    return new CreateInternalMedicalPrescriptionInput(
        "Reavaliação de FIV+", "Reavaliar em 30 dias.", medication);
  }

  private static CreatePrescribedMedicationInput medicationWithId(Integer medicationId) {
    return new CreatePrescribedMedicationInput(
        medicationId, null, null, "0,5 ml", AdministrationRoute.Subcutaneous, 48, 90);
  }

  private static CreatePrescribedMedicationInput medicationWithNewName(String name, String unit) {
    return new CreatePrescribedMedicationInput(
        null, name, unit, "0,5 ml", AdministrationRoute.Oral, 24, 7);
  }
}
