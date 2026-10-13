package org.amicats.backend.domain.usecase.doseadministration.register;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Locale;
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
    @NotNull DoseRegistrationOrigin origin,
    @Schema(
            description =
                "Quantidade na unidade do estoque, obrigatória para novas doses. Ausente somente no replay de dose histórica sem consumo.")
        @DecimalMin(value = "0", inclusive = false)
        @Digits(integer = 9, fraction = 3)
        BigDecimal consumedQuantity,
    @Schema(
            description =
                "Unidade do estoque, sem conversão automática; obrigatória para novas doses.")
        @Size(max = 30)
        String consumedUnit) {

  public RegisterDoseAdministrationInput {
    consumedUnit = consumedUnit == null ? null : consumedUnit.trim().toLowerCase(Locale.ROOT);
    // PostgreSQL TIMESTAMP(6): canonicalize before comparison and persistence.
    administeredAt = administeredAt == null ? null : administeredAt.truncatedTo(ChronoUnit.MICROS);
    notes = notes == null || notes.isBlank() ? null : notes.trim();
  }
}
