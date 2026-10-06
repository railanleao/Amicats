package org.amicats.backend.domain.usecase.internalmedicalprescription.create;

import java.time.Clock;
import java.time.Duration;
import java.time.LocalDateTime;
import lombok.Builder;
import org.amicats.backend.domain.entity.Cat;
import org.amicats.backend.domain.entity.InternalMedicalPrescription;
import org.amicats.backend.domain.entity.User;
import org.amicats.backend.domain.interfaces.dataprovider.cat.CatDataProvider;
import org.amicats.backend.domain.interfaces.dataprovider.internalmedicalprescription.InternalMedicalPrescriptionDataProvider;
import org.amicats.backend.domain.interfaces.dataprovider.user.UserDataProvider;
import org.amicats.backend.domain.usecase.common.VeterinarianPolicy;
import org.amicats.backend.domain.usecase.internalmedicalprescription.read.ReadInternalMedicalPrescriptionOutput;
import org.amicats.backend.domain.usecase.prescribedmedication.create.CreatePrescribedMedicationUseCase;
import org.amicats.backend.domain.usecase.prescribedmedication.read.ReadPrescribedMedicationOutput;
import org.amicats.backend.exception.InvalidPrescribedMedicationException;
import org.amicats.backend.exception.ResourceNotFoundException;
import org.springframework.transaction.annotation.Transactional;

@Builder
public class CreateInternalMedicalPrescriptionUseCase {

  private static final Duration MAX_FUTURE_SKEW = Duration.ofMinutes(5);
  private static final Duration MAX_RECORDED_AGE = Duration.ofDays(30);

  private CatDataProvider catDataProvider;
  private UserDataProvider userDataProvider;
  private InternalMedicalPrescriptionDataProvider internalMedicalPrescriptionDataProvider;
  private CreatePrescribedMedicationUseCase createPrescribedMedicationUseCase;
  @Builder.Default private Clock clock = Clock.systemUTC();

  @Transactional
  public ReadInternalMedicalPrescriptionOutput execute(
      Integer catId, Integer veterinarianId, CreateInternalMedicalPrescriptionInput input) {
    User veterinarian = VeterinarianPolicy.requireVeterinarian(userDataProvider, veterinarianId);

    Cat cat =
        catDataProvider
            .findById(catId)
            .orElseThrow(() -> new ResourceNotFoundException("Gato não encontrado."));

    InternalMedicalPrescription prescription =
        new InternalMedicalPrescription(
            cat,
            veterinarian,
            input.title().trim(),
            blankToNull(input.notes()),
            input.medication() != null,
            resolveRecordedAt(input.recordedAt()));
    internalMedicalPrescriptionDataProvider.save(prescription);

    ReadPrescribedMedicationOutput medication =
        input.medication() == null
            ? null
            : createPrescribedMedicationUseCase.execute(prescription, input.medication());

    return ReadInternalMedicalPrescriptionOutput.from(prescription, medication);
  }

  private LocalDateTime resolveRecordedAt(LocalDateTime recordedAt) {
    LocalDateTime now = LocalDateTime.now(clock);

    if (recordedAt == null) {
      return now;
    }

    if (recordedAt.isAfter(now.plus(MAX_FUTURE_SKEW))
        || recordedAt.isBefore(now.minus(MAX_RECORDED_AGE))) {
      throw new InvalidPrescribedMedicationException(
          "A data do registro está fora do intervalo permitido.");
    }

    return recordedAt;
  }

  private static String blankToNull(String value) {
    return value == null || value.isBlank() ? null : value.trim();
  }
}
