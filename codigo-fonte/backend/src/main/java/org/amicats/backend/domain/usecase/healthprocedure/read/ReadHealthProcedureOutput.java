package org.amicats.backend.domain.usecase.healthprocedure.read;

import java.time.LocalDate;
import java.time.LocalDateTime;
import org.amicats.backend.domain.entity.HealthProcedure;
import org.amicats.backend.domain.enums.HealthProcedureStatus;
import org.amicats.backend.domain.enums.HealthProcedureType;

public record ReadHealthProcedureOutput(
    Integer id,
    Integer catId,
    String catName,
    HealthProcedureType type,
    String name,
    HealthProcedureStatus status,
    boolean overdue,
    LocalDate scheduledDate,
    LocalDate completedDate,
    String notes,
    String cancelReason,
    Integer previousHealthProcedureId,
    String createdByName,
    LocalDateTime createdAt) {

  public static ReadHealthProcedureOutput from(HealthProcedure h, LocalDate today) {
    return new ReadHealthProcedureOutput(
        h.getId(),
        h.getCat().getId(),
        h.getCat().getName(),
        h.getType(),
        h.getName(),
        h.getStatus(),
        h.isOverdue(today),
        h.getScheduledDate(),
        h.getCompletedDate(),
        h.getNotes(),
        h.getCancelReason(),
        h.getPreviousHealthProcedure() != null ? h.getPreviousHealthProcedure().getId() : null,
        h.getCreatedBy().getFullName(),
        h.getCreatedAt());
  }
}
