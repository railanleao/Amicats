package org.amicats.backend.domain.usecase.prescribedmedication.read;

import java.time.LocalDate;
import org.amicats.backend.domain.entity.PrescribedMedication;
import org.amicats.backend.domain.enums.AdministrationRoute;
import org.amicats.backend.domain.enums.MedicalPrescriptionOrigin;
import org.amicats.backend.domain.enums.PrescribedMedicationStatus;
import org.amicats.backend.domain.enums.StockStatus;

public record ReadPrescribedMedicationOutput(
    Integer id,
    MedicalPrescriptionOrigin origin,
    Integer medicalPrescriptionId,
    Integer medicationId,
    String medicationName,
    StockStatus medicationStockStatus,
    String dosage,
    AdministrationRoute route,
    Integer intervalHours,
    Integer durationDays,
    LocalDate startDate,
    LocalDate endDate,
    PrescribedMedicationStatus status,
    String stockWarning) {

  public static ReadPrescribedMedicationOutput from(PrescribedMedication pm, LocalDate today) {
    return withStockWarning(pm, today, null);
  }

  public static ReadPrescribedMedicationOutput withStockWarning(
      PrescribedMedication pm, LocalDate today, String stockWarning) {
    return new ReadPrescribedMedicationOutput(
        pm.getId(),
        pm.getOrigin(),
        pm.getMedicalPrescriptionId(),
        pm.getMedication().getId(),
        pm.getMedication().getName(),
        pm.getMedication().getStatus(),
        pm.getDosage(),
        pm.getRoute(),
        pm.getIntervalHours(),
        pm.getDurationDays(),
        pm.getStartDate(),
        pm.getEndDate(),
        pm.getEffectiveStatus(today),
        stockWarning);
  }
}
