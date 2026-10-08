package org.amicats.backend.domain.usecase.doseadministration.register;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.UUID;
import org.amicats.backend.domain.enums.DoseRegistrationOrigin;

public record RegisterDoseAdministrationInput(
    @NotNull UUID clientOperationId,
    @NotNull LocalDateTime administeredAt,
    @Size(max = 2000) String notes,
    @NotNull DoseRegistrationOrigin origin) {

  public RegisterDoseAdministrationInput {
    // PostgreSQL TIMESTAMP(6): canonicalize before comparison and persistence.
    administeredAt = administeredAt == null ? null : administeredAt.truncatedTo(ChronoUnit.MICROS);
    notes = notes == null || notes.isBlank() ? null : notes.trim();
  }
}
