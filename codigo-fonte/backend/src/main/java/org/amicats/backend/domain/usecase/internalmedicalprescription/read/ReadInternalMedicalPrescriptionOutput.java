package org.amicats.backend.domain.usecase.internalmedicalprescription.read;

import java.time.LocalDateTime;
import org.amicats.backend.domain.entity.InternalMedicalPrescription;
import org.amicats.backend.domain.entity.User;
import org.amicats.backend.domain.enums.MedicalPrescriptionStatus;
import org.amicats.backend.domain.usecase.prescribedmedication.read.ReadPrescribedMedicationOutput;

public record ReadInternalMedicalPrescriptionOutput(
    Integer id,
    Integer catId,
    MedicalPrescriptionStatus status,
    String title,
    String notes,
    String veterinarianName,
    String veterinarianCrmv,
    String veterinarianUfCrmv,
    LocalDateTime createdAt,
    ReadPrescribedMedicationOutput medication) {

  public static ReadInternalMedicalPrescriptionOutput from(
      InternalMedicalPrescription prescription, ReadPrescribedMedicationOutput medication) {
    User vet = prescription.getVeterinarian();

    return new ReadInternalMedicalPrescriptionOutput(
        prescription.getId(),
        prescription.getCat().getId(),
        prescription.getStatus(),
        prescription.getTitle(),
        prescription.getNotes(),
        vet.getFullName(),
        vet.getCrmv(),
        vet.getUfCrmv(),
        prescription.getCreatedAt(),
        medication);
  }
}
