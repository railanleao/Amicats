package org.amicats.backend.domain.usecase.doseadministration.register;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.UUID;
import org.amicats.backend.domain.enums.DoseRegistrationOrigin;

/**
 * administeredAt represents UTC, not the phone's local wall clock. The LocalDateTime contract is
 * retained: convert to UTC before serializing. Precision is normalized to PostgreSQL TIMESTAMP(6).
 */
public record RegisterDoseAdministrationInput(
    @NotNull UUID clientOperationId,
    @Schema(
            description =
                "Data/hora da aplicação em UTC. Não enviar horário local do aparelho. "
                    + "Tolerância de até 5 minutos à frente do relógio do servidor.",
            example = "2026-10-08T14:00:00")
        @NotNull
        LocalDateTime administeredAt,
    @Size(max = 2000) String notes,
    @NotNull DoseRegistrationOrigin origin) {

  public RegisterDoseAdministrationInput {
    // PostgreSQL TIMESTAMP(6): canonicalize before comparison and persistence.
    administeredAt = administeredAt == null ? null : administeredAt.truncatedTo(ChronoUnit.MICROS);
    notes = notes == null || notes.isBlank() ? null : notes.trim();
  }
}
