package org.amicats.backend.domain.usecase.healthprocedure.read;

import org.amicats.backend.domain.enums.HealthProcedureStatus;
import org.amicats.backend.domain.enums.HealthProcedureType;

public record HealthProcedureSearchCriteria(
    String search,
    Integer catId,
    HealthProcedureType type,
    HealthProcedureStatus status,
    int page,
    int size) {}
