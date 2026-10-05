package org.amicats.backend.domain.usecase.prescribedmedication.create;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.amicats.backend.domain.enums.AdministrationRoute;

public record CreatePrescribedMedicationInput(
    Integer medicationId,
    @Size(max = 150) String newMedicationName,
    @Size(max = 30) String newMedicationUnit,
    @NotBlank @Size(max = 50) String dosage,
    @NotNull AdministrationRoute route,
    @NotNull @Min(1) @Max(720) Integer intervalHours,
    @NotNull @Min(1) @Max(365) Integer durationDays) {

  public boolean hasNewMedication() {
    return newMedicationName != null && !newMedicationName.isBlank();
  }
}
