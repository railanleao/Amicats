package org.amicats.backend.domain.usecase.healthprocedure.complete;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record CompleteHealthProcedureInput(
    @NotNull LocalDate completedDate, @Size(max = 1000) String notes, LocalDate boosterDate) {}
