package org.amicats.backend.domain.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.amicats.backend.domain.enums.HealthProcedureAction;
import org.amicats.backend.domain.enums.HealthProcedureField;
import org.amicats.backend.domain.enums.HealthProcedureStatus;
import org.amicats.backend.domain.enums.HealthProcedureType;
import org.amicats.backend.domain.enums.NeuteringStatus;
import org.amicats.backend.exception.HealthProcedureConflictException;
import org.amicats.backend.exception.InvalidHealthProcedureException;

@Entity
@Table(name = "health_procedures")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class HealthProcedure {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id_health_procedure")
  private Integer id;

  @Column(name = "updated_at", insertable = false, updatable = false)
  private LocalDateTime updatedAt;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "id_cat", nullable = false)
  private Cat cat;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private HealthProcedureType type;

  @Column(length = 150)
  private String name;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private HealthProcedureStatus status;

  @Column(name = "scheduled_date", nullable = false)
  private LocalDate scheduledDate;

  @Column(name = "completed_date")
  private LocalDate completedDate;

  @Column(columnDefinition = "text")
  private String notes;

  @Column(name = "cancel_reason", columnDefinition = "text")
  private String cancelReason;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "id_previous_health_procedure")
  private HealthProcedure previousHealthProcedure;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "id_user_created_by", nullable = false)
  private User createdBy;

  @Column(name = "created_at", nullable = false)
  private LocalDateTime createdAt;

  @OneToMany(
      mappedBy = "healthProcedure",
      cascade = {CascadeType.PERSIST, CascadeType.MERGE})
  @OrderBy("changedAt DESC, id DESC")
  private List<HealthProcedureChange> changes = new ArrayList<>();

  private HealthProcedure(
      Cat cat,
      HealthProcedureType type,
      String name,
      LocalDate scheduledDate,
      String notes,
      User createdBy,
      LocalDateTime now,
      LocalDate today) {
    this.cat = cat;
    this.type = type;
    this.name = resolveName(type, name);
    this.status = HealthProcedureStatus.Scheduled;
    this.scheduledDate = requireTodayOrLater(scheduledDate, today);
    this.notes = blankToNull(notes);
    this.createdBy = createdBy;
    this.createdAt = now;
    record(HealthProcedureAction.Created, null, null, null, createdBy, now);
  }

  public static HealthProcedure schedule(
      Cat cat,
      HealthProcedureType type,
      String name,
      LocalDate scheduledDate,
      String notes,
      User createdBy,
      LocalDateTime now,
      LocalDate today) {
    if (type == HealthProcedureType.Neutering) {
      if (cat.getNeuteringStatus() == NeuteringStatus.Neutered) {
        throw new HealthProcedureConflictException(cat.getName() + " já está castrado(a).");
      }
      cat.registerNeutering(NeuteringStatus.Scheduled, null);
    }
    return new HealthProcedure(cat, type, name, scheduledDate, notes, createdBy, now, today);
  }

  public HealthProcedure scheduleBooster(
      LocalDate boosterDate, User user, LocalDateTime now, LocalDate today) {
    if (type != HealthProcedureType.Vaccine || status != HealthProcedureStatus.Completed) {
      throw new InvalidHealthProcedureException(
          "Só é possível agendar reforço de uma vacina realizada.");
    }
    if (!boosterDate.isAfter(completedDate)) {
      throw new InvalidHealthProcedureException("O reforço precisa ser depois da data da vacina.");
    }
    HealthProcedure booster =
        new HealthProcedure(cat, type, name, boosterDate, null, user, now, today);
    booster.previousHealthProcedure = this;
    return booster;
  }

  public void update(
      String name,
      LocalDate scheduledDate,
      String notes,
      User user,
      LocalDateTime now,
      LocalDate today) {
    requireScheduled();

    String resolvedName = resolveName(type, name);
    if (!Objects.equals(this.name, resolvedName)) {
      record(
          HealthProcedureAction.Updated,
          HealthProcedureField.Name,
          this.name,
          resolvedName,
          user,
          now);
      this.name = resolvedName;
    }

    if (!this.scheduledDate.equals(scheduledDate)) {
      requireTodayOrLater(scheduledDate, today);
      record(
          HealthProcedureAction.Updated,
          HealthProcedureField.ScheduledDate,
          this.scheduledDate.toString(),
          scheduledDate.toString(),
          user,
          now);
      this.scheduledDate = scheduledDate;
    }

    updateNotes(notes, HealthProcedureAction.Updated, user, now);
  }

  public void complete(
      LocalDate completedDate, String notes, User user, LocalDateTime now, LocalDate today) {
    requireScheduled();
    if (completedDate.isAfter(today)) {
      throw new InvalidHealthProcedureException("A data de realização não pode ser no futuro.");
    }

    updateNotes(notes, HealthProcedureAction.Completed, user, now);
    this.status = HealthProcedureStatus.Completed;
    this.completedDate = completedDate;
    record(
        HealthProcedureAction.Completed,
        HealthProcedureField.CompletedDate,
        null,
        completedDate.toString(),
        user,
        now);

    if (type == HealthProcedureType.Neutering) {
      cat.registerNeutering(NeuteringStatus.Neutered, completedDate);
    }
  }

  public void cancel(String reason, User user, LocalDateTime now) {
    requireScheduled();
    String resolvedReason = blankToNull(reason);
    if (resolvedReason == null) {
      throw new InvalidHealthProcedureException("Informe o motivo do cancelamento.");
    }

    this.status = HealthProcedureStatus.Cancelled;
    this.cancelReason = resolvedReason;
    record(
        HealthProcedureAction.Cancelled,
        HealthProcedureField.CancelReason,
        null,
        resolvedReason,
        user,
        now);

    if (type == HealthProcedureType.Neutering
        && cat.getNeuteringStatus() == NeuteringStatus.Scheduled) {
      cat.registerNeutering(NeuteringStatus.NotNeutered, null);
    }
  }

  public boolean isOverdue(LocalDate today) {
    return status == HealthProcedureStatus.Scheduled && scheduledDate.isBefore(today);
  }

  public List<HealthProcedureChange> getChanges() {
    return Collections.unmodifiableList(changes);
  }

  private void updateNotes(
      String notes, HealthProcedureAction action, User user, LocalDateTime now) {
    String resolvedNotes = blankToNull(notes);
    if (!Objects.equals(this.notes, resolvedNotes)) {
      record(action, HealthProcedureField.Notes, this.notes, resolvedNotes, user, now);
      this.notes = resolvedNotes;
    }
  }

  private void requireScheduled() {
    if (status != HealthProcedureStatus.Scheduled) {
      throw new InvalidHealthProcedureException(
          "Só é possível alterar um agendamento que ainda não foi realizado nem cancelado.");
    }
  }

  private void record(
      HealthProcedureAction action,
      HealthProcedureField field,
      String oldValue,
      String newValue,
      User user,
      LocalDateTime now) {
    changes.add(new HealthProcedureChange(this, action, field, oldValue, newValue, user, now));
  }

  private static String resolveName(HealthProcedureType type, String name) {
    if (type == HealthProcedureType.Neutering) {
      return null;
    }
    String resolved = blankToNull(name);
    if (resolved == null) {
      throw new InvalidHealthProcedureException("Informe o nome da vacina ou do vermífugo.");
    }
    return resolved;
  }

  private static LocalDate requireTodayOrLater(LocalDate date, LocalDate today) {
    if (date.isBefore(today)) {
      throw new InvalidHealthProcedureException("A data agendada não pode ser no passado.");
    }
    return date;
  }

  private static String blankToNull(String value) {
    return value == null || value.isBlank() ? null : value.trim();
  }
}
