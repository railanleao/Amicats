package org.amicats.backend.domain.usecase.healthprocedure.cancel;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CancelHealthProcedureInput(@NotBlank @Size(max = 500) String reason) {}
