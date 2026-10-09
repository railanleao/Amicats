package org.amicats.backend.domain.usecase.healthprocedure.update;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record UpdateHealthProcedureInput(
    @Size(max = 150) String name,
    @NotNull LocalDate scheduledDate,
    @Size(max = 1000) String notes) {}
