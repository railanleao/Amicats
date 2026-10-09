package org.amicats.backend.repository.healthprocedure;

import jakarta.persistence.LockModeType;
import java.util.Optional;
import org.amicats.backend.domain.entity.HealthProcedure;
import org.amicats.backend.domain.enums.HealthProcedureStatus;
import org.amicats.backend.domain.enums.HealthProcedureType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface HealthProcedureRepository extends JpaRepository<HealthProcedure, Integer> {

  String SEARCH_FILTER =
      "(:searchPattern is null or lower(c.name) like :searchPattern escape '!' "
          + "or lower(h.name) like :searchPattern escape '!') "
          + "and (:catId is null or c.id = :catId) "
          + "and h.type = coalesce(:type, h.type) "
          + "and h.status = coalesce(:status, h.status)";

  @Query("select h from HealthProcedure h join fetch h.cat join fetch h.createdBy where h.id = :id")
  Optional<HealthProcedure> findByIdFetchingDetails(@Param("id") Integer id);

  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("select h from HealthProcedure h join fetch h.cat join fetch h.createdBy where h.id = :id")
  Optional<HealthProcedure> findByIdForUpdate(@Param("id") Integer id);

  @Query(
      value =
          "select h from HealthProcedure h join fetch h.cat c join fetch h.createdBy where "
              + SEARCH_FILTER,
      countQuery = "select count(h) from HealthProcedure h join h.cat c where " + SEARCH_FILTER)
  Page<HealthProcedure> search(
      @Param("searchPattern") String searchPattern,
      @Param("catId") Integer catId,
      @Param("type") HealthProcedureType type,
      @Param("status") HealthProcedureStatus status,
      Pageable pageable);

  Optional<HealthProcedure> findFirstByCatIdAndTypeAndStatusOrderByCompletedDateDesc(
      Integer catId, HealthProcedureType type, HealthProcedureStatus status);

  Optional<HealthProcedure> findFirstByCatIdAndStatusOrderByScheduledDateAsc(
      Integer catId, HealthProcedureStatus status);

  boolean existsByCatIdAndTypeAndStatus(
      Integer catId, HealthProcedureType type, HealthProcedureStatus status);
}
