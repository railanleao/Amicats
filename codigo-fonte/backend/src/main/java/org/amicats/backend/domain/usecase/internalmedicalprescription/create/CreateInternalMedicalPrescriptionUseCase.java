package org.amicats.backend.domain.usecase.internalmedicalprescription.create;

import java.time.Clock;
import java.time.LocalDateTime;
import lombok.Builder;
import org.amicats.backend.domain.entity.Cat;
import org.amicats.backend.domain.entity.InternalMedicalPrescription;
import org.amicats.backend.domain.entity.User;
import org.amicats.backend.domain.interfaces.dataprovider.cat.CatDataProvider;
import org.amicats.backend.domain.interfaces.dataprovider.internalmedicalprescription.InternalMedicalPrescriptionDataProvider;
import org.amicats.backend.domain.interfaces.dataprovider.user.UserDataProvider;
import org.amicats.backend.domain.policy.DoseAdministrationTimePolicy;
import org.amicats.backend.domain.usecase.common.VeterinarianPolicy;
import org.amicats.backend.domain.usecase.internalmedicalprescription.read.ReadInternalMedicalPrescriptionOutput;
import org.amicats.backend.domain.usecase.prescribedmedication.create.CreatePrescribedMedicationUseCase;
import org.amicats.backend.domain.usecase.prescribedmedication.read.ReadPrescribedMedicationOutput;
import org.amicats.backend.exception.ResourceNotFoundException;
import org.springframework.transaction.annotation.Transactional;

@Builder
public class CreateInternalMedicalPrescriptionUseCase {

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

    LocalDateTime recordedAt = DoseAdministrationTimePolicy.nowUtc(clock);

    InternalMedicalPrescription prescription =
        new InternalMedicalPrescription(
            cat,
            veterinarian,
            input.title().trim(),
            blankToNull(input.notes()),
            input.medication() != null,
            recordedAt);

    internalMedicalPrescriptionDataProvider.save(prescription);

    ReadPrescribedMedicationOutput medication =
        input.medication() == null
            ? null
            : createPrescribedMedicationUseCase.execute(prescription, input.medication());

    return ReadInternalMedicalPrescriptionOutput.from(prescription, medication);
  }

  private static String blankToNull(String value) {
    return value == null || value.isBlank() ? null : value.trim();
  }
}
