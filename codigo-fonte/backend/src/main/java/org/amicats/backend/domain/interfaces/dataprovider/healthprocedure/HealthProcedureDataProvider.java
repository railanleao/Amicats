package org.amicats.backend.domain.interfaces.dataprovider.healthprocedure;

import java.util.Optional;
import org.amicats.backend.domain.entity.HealthProcedure;
import org.amicats.backend.domain.enums.HealthProcedureType;
import org.amicats.backend.domain.usecase.common.PagedResult;
import org.amicats.backend.domain.usecase.healthprocedure.read.HealthProcedureSearchCriteria;

public interface HealthProcedureDataProvider {

  HealthProcedure save(HealthProcedure healthProcedure);

  Optional<HealthProcedure> findById(Integer id);

  Optional<HealthProcedure> findByIdForUpdate(Integer id);

  PagedResult<HealthProcedure> search(HealthProcedureSearchCriteria criteria);

  Optional<HealthProcedure> findLastCompleted(Integer catId, HealthProcedureType type);

  Optional<HealthProcedure> findNextScheduled(Integer catId);

  boolean existsScheduled(Integer catId, HealthProcedureType type);
}
