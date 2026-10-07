package org.amicats.backend.domain.usecase.internalmedicalprescription.create;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import org.amicats.backend.domain.usecase.prescribedmedication.create.CreatePrescribedMedicationInput;

public record CreateInternalMedicalPrescriptionInput(
    @NotBlank @Size(max = 200) String title,
    @Size(max = 2000) String notes,
    @Valid CreatePrescribedMedicationInput medication,
    LocalDateTime recordedAt) {}
