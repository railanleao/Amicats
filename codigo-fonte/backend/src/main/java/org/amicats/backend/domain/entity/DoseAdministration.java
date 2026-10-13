package org.amicats.backend.domain.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.Locale;
import java.util.Objects;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.amicats.backend.domain.enums.AdministrationRoute;
import org.amicats.backend.domain.enums.DoseRegistrationOrigin;
import org.amicats.backend.domain.enums.PrescribedMedicationStatus;
import org.amicats.backend.domain.policy.DoseAdministrationTimePolicy;
import org.amicats.backend.exception.DoseAdministrationConflictException;
import org.amicats.backend.exception.InvalidDoseAdministrationException;
import org.amicats.backend.exception.InvalidStockConsumptionException;

@Entity
@Table(name = "dose_administrations")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class DoseAdministration {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id_dose_administration")
  private Integer id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "id_prescribed_medication", nullable = false, updatable = false)
  private PrescribedMedication prescribedMedication;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "id_user_administered_by", nullable = false, updatable = false)
  private User administeredBy;

  @Column(name = "client_operation_id", nullable = false, unique = true, updatable = false)
  private UUID clientOperationId;

  @Column(name = "administered_at", nullable = false, updatable = false)
  private LocalDateTime administeredAt;

  @Column(name = "recorded_at", nullable = false, updatable = false)
  private LocalDateTime recordedAt;

  @Column(length = 2000, updatable = false)
  private String notes;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20, updatable = false)
  private DoseRegistrationOrigin origin;

  // Snapshot of what was confirmed as administered, according to the prescription.
  @Column(nullable = false, length = 50, updatable = false)
  private String dosage;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20, updatable = false)
  private AdministrationRoute route;

  @Column(name = "consumed_quantity", precision = 12, scale = 3, updatable = false)
  private BigDecimal consumedQuantity;

  @Column(name = "consumed_unit", length = 30, updatable = false)
  private String consumedUnit;

  @Column(name = "stock_balance_after", precision = 12, scale = 3, updatable = false)
  private BigDecimal stockBalanceAfter;

  public void prepareConsumption(StockItem item, BigDecimal quantity, String unit) {
    if (quantity == null
        || quantity.signum() <= 0
        || quantity.stripTrailingZeros().scale() > 3
        || quantity.compareTo(new BigDecimal("999999999.999")) > 0
        || unit == null
        || unit.isBlank()
        || unit.length() > 30) {
      throw new InvalidStockConsumptionException("Quantidade/unidade consumida inválida.");
    }
    if (!item.getUnit().trim().equalsIgnoreCase(unit.trim())) {
      throw new InvalidStockConsumptionException(
          "Informe a quantidade na unidade do estoque: " + item.getUnit());
    }
    this.consumedQuantity = quantity;
    this.consumedUnit = unit.trim().toLowerCase(Locale.ROOT);
    this.stockBalanceAfter = item.getQuantity().subtract(quantity);
    if (stockBalanceAfter.compareTo(new BigDecimal("-999999999.999")) < 0) {
      throw new InvalidStockConsumptionException("Saldo resultante excede o limite suportado.");
    }
  }

  public boolean matchesConsumption(BigDecimal quantity, String unit) {
    return (consumedQuantity == null && consumedUnit == null && quantity == null && unit == null)
        || consumedQuantity != null
            && quantity != null
            && consumedQuantity.compareTo(quantity) == 0
            && Objects.equals(consumedUnit, unit);
  }

  public static DoseAdministration register(
      PrescribedMedication medication,
      User user,
      UUID operationId,
      LocalDateTime administeredAt,
      LocalDateTime recordedAt,
      String notes,
      DoseRegistrationOrigin origin) {
    return register(
        medication,
        user,
        operationId,
        administeredAt,
        recordedAt,
        notes,
        origin,
        DoseAdministrationTimePolicy.DEFAULT_CLINICAL_ZONE);
  }

  /** Times are UTC; the prescription dates belong to the clinical calendar. */
  public static DoseAdministration register(
      PrescribedMedication medication,
      User user,
      UUID operationId,
      LocalDateTime administeredAt,
      LocalDateTime recordedAt,
      String notes,
      DoseRegistrationOrigin origin,
      ZoneId clinicalZone) {
    if (medication == null
        || user == null
        || operationId == null
        || administeredAt == null
        || recordedAt == null
        || origin == null
        || clinicalZone == null) {
      throw new InvalidDoseAdministrationException("Informe todos os dados obrigatórios da dose.");
    }
    LocalDateTime applied = administeredAt.truncatedTo(ChronoUnit.MICROS);
    LocalDateTime recorded = recordedAt.truncatedTo(ChronoUnit.MICROS);
    String normalizedNotes = notes == null || notes.isBlank() ? null : notes.trim();
    if (normalizedNotes != null && normalizedNotes.length() > 2000) {
      throw new InvalidDoseAdministrationException("Observações devem ter até 2000 caracteres.");
    }
    if (DoseAdministrationTimePolicy.exceedsFutureSkew(applied, recorded)) {
      throw new InvalidDoseAdministrationException(
          "A aplicação não pode estar mais de 5 minutos no futuro.");
    }
    // createdAt preserves the validated clinical timestamp, including offline prescriptions.
    if (applied.isBefore(medication.getCreatedAt())
        || !DoseAdministrationTimePolicy.isWithinTreatmentPeriod(
            applied, medication.getStartDate(), medication.getEndDate(), clinicalZone)) {
      throw new InvalidDoseAdministrationException("Aplicação fora do período prescrito.");
    }
    if ((medication.getCancelledAt() != null && !applied.isBefore(medication.getCancelledAt()))
        || (medication.getStatus() == PrescribedMedicationStatus.Cancelled
            && medication.getCancelledAt() == null)) {
      throw new DoseAdministrationConflictException(
          "A medicação estava cancelada no momento da aplicação. Mantenha o lançamento pendente para revisão.");
    }
    DoseAdministration dose = new DoseAdministration();
    dose.prescribedMedication = medication;
    dose.administeredBy = user;
    dose.clientOperationId = operationId;
    dose.administeredAt = applied;
    dose.recordedAt = recorded;
    dose.notes = normalizedNotes;
    dose.origin = origin;
    dose.dosage = medication.getDosage();
    dose.route = medication.getRoute();
    return dose;
  }

  public boolean matches(
      Integer medicationId,
      Integer userId,
      LocalDateTime applied,
      String submittedNotes,
      DoseRegistrationOrigin submittedOrigin) {
    return Objects.equals(prescribedMedication.getId(), medicationId)
        && Objects.equals(administeredBy.getId(), userId)
        && Objects.equals(administeredAt, applied)
        && Objects.equals(notes, submittedNotes)
        && origin == submittedOrigin;
  }
}
