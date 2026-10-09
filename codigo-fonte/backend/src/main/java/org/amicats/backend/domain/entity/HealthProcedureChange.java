package org.amicats.backend.domain.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.amicats.backend.domain.enums.HealthProcedureAction;
import org.amicats.backend.domain.enums.HealthProcedureField;

@Entity
@Table(name = "health_procedure_changes")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class HealthProcedureChange {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id_health_procedure_change")
  private Integer id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "id_health_procedure", nullable = false)
  private HealthProcedure healthProcedure;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private HealthProcedureAction action;

  @Enumerated(EnumType.STRING)
  @Column(length = 30)
  private HealthProcedureField field;

  @Column(name = "old_value", columnDefinition = "text")
  private String oldValue;

  @Column(name = "new_value", columnDefinition = "text")
  private String newValue;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "id_user", nullable = false)
  private User user;

  @Column(name = "changed_at", nullable = false)
  private LocalDateTime changedAt;

  HealthProcedureChange(
      HealthProcedure healthProcedure,
      HealthProcedureAction action,
      HealthProcedureField field,
      String oldValue,
      String newValue,
      User user,
      LocalDateTime changedAt) {
    this.healthProcedure = healthProcedure;
    this.action = action;
    this.field = field;
    this.oldValue = oldValue;
    this.newValue = newValue;
    this.user = user;
    this.changedAt = changedAt;
  }
}
