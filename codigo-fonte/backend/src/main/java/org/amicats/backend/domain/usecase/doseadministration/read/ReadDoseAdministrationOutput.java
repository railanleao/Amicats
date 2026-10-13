package org.amicats.backend.domain.usecase.doseadministration.read;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;
import org.amicats.backend.domain.entity.DoseAdministration;
import org.amicats.backend.domain.enums.AdministrationRoute;
import org.amicats.backend.domain.enums.DoseRegistrationOrigin;

public record ReadDoseAdministrationOutput(
    Integer id,
    Integer prescribedMedicationId,
    Integer catId,
    Integer medicationId,
    String medicationName,
    String dosage,
    AdministrationRoute route,
    Integer administeredById,
    String administeredByName,
    LocalDateTime administeredAt,
    LocalDateTime recordedAt,
    String notes,
    DoseRegistrationOrigin origin,
    UUID clientOperationId,
    BigDecimal consumedQuantity,
    String consumedUnit,
    BigDecimal stockBalanceAfter,
    boolean stockDivergenceAtRegistration) {

  public static ReadDoseAdministrationOutput from(DoseAdministration dose) {
    var medication = dose.getPrescribedMedication();
    return new ReadDoseAdministrationOutput(
        dose.getId(),
        medication.getId(),
        medication.getCat().getId(),
        medication.getMedication().getId(),
        medication.getMedication().getName(),
        dose.getDosage(),
        dose.getRoute(),
        dose.getAdministeredBy().getId(),
        dose.getAdministeredBy().getFullName(),
        dose.getAdministeredAt(),
        dose.getRecordedAt(),
        dose.getNotes(),
        dose.getOrigin(),
        dose.getClientOperationId(),
        dose.getConsumedQuantity(),
        dose.getConsumedUnit(),
        dose.getStockBalanceAfter(),
        dose.getStockBalanceAfter() != null && dose.getStockBalanceAfter().signum() < 0);
  }
}
