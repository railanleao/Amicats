package org.amicats.backend.domain.usecase.prescribedmedication.cancel;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CancelPrescribedMedicationInput(@NotBlank @Size(max = 500) String reason) {}
