package org.amicats.backend.domain.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Objects;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.amicats.backend.domain.enums.AdministrationRoute;
import org.amicats.backend.domain.enums.DoseRegistrationOrigin;
import org.amicats.backend.domain.enums.PrescribedMedicationStatus;
import org.amicats.backend.exception.DoseAdministrationConflictException;
import org.amicats.backend.exception.InvalidDoseAdministrationException;

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

  public static DoseAdministration register(
    PrescribedMedication medication, User user, UUID operationId,
    LocalDateTime administeredAt, LocalDateTime recordedAt,
    String notes, DoseRegistrationOrigin origin) 
    {
        if (medication == null || user == null || operationId == null
        || administeredAt == null || recordedAt == null || origin == null) {
        throw new InvalidDoseAdministrationException("Informe todos os dados obrigatórios da dose.");
        }
        LocalDateTime applied = administeredAt.truncatedTo(ChronoUnit.MICROS);
        LocalDateTime recorded = recordedAt.truncatedTo(ChronoUnit.MICROS);
        String normalizedNotes = notes == null || notes.isBlank() ? null : notes.trim();
        if (normalizedNotes != null && normalizedNotes.length() > 2000) {
        throw new InvalidDoseAdministrationException("Observações devem ter até 2000 caracteres.");
        }
        if (applied.isAfter(recorded)) {
        throw new InvalidDoseAdministrationException("A aplicação não pode estar no futuro.");
        }
        if (applied.isBefore(medication.getCreatedAt())
            || applied.toLocalDate().isBefore(medication.getStartDate())
            || applied.toLocalDate().isAfter(medication.getEndDate())) {
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
    Integer medicationId, Integer userId, LocalDateTime applied,
    String submittedNotes, DoseRegistrationOrigin submittedOrigin) {
    return Objects.equals(prescribedMedication.getId(), medicationId)
        && Objects.equals(administeredBy.getId(), userId)
        && Objects.equals(administeredAt, applied)
        && Objects.equals(notes, submittedNotes)
        && origin == submittedOrigin;
  }
}