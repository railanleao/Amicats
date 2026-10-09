package org.amicats.backend.domain.usecase.healthprocedure.create;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import org.amicats.backend.domain.enums.HealthProcedureType;

public record CreateHealthProcedureInput(
    @NotNull Integer catId,
    @NotNull HealthProcedureType type,
    @Size(max = 150) String name,
    @NotNull LocalDate scheduledDate,
    @Size(max = 1000) String notes) {}
