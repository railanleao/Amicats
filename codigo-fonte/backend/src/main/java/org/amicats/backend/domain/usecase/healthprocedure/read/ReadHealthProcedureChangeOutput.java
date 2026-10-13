package org.amicats.backend.domain.usecase.healthprocedure.read;

import java.time.LocalDateTime;
import org.amicats.backend.domain.entity.HealthProcedureChange;
import org.amicats.backend.domain.enums.HealthProcedureAction;
import org.amicats.backend.domain.enums.HealthProcedureField;

public record ReadHealthProcedureChangeOutput(
    Integer id,
    HealthProcedureAction action,
    HealthProcedureField field,
    String oldValue,
    String newValue,
    String userName,
    LocalDateTime changedAt) {

  public static ReadHealthProcedureChangeOutput from(HealthProcedureChange change) {
    return new ReadHealthProcedureChangeOutput(
        change.getId(),
        change.getAction(),
        change.getField(),
        change.getOldValue(),
        change.getNewValue(),
        change.getUser().getFullName(),
        change.getChangedAt());
  }
}
