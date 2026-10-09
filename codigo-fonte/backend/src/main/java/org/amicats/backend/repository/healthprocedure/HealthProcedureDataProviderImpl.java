package org.amicats.backend.repository.healthprocedure;

import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.amicats.backend.domain.entity.HealthProcedure;
import org.amicats.backend.domain.enums.HealthProcedureStatus;
import org.amicats.backend.domain.enums.HealthProcedureType;
import org.amicats.backend.domain.interfaces.dataprovider.healthprocedure.HealthProcedureDataProvider;
import org.amicats.backend.domain.usecase.common.PagedResult;
import org.amicats.backend.domain.usecase.healthprocedure.read.HealthProcedureSearchCriteria;
import org.amicats.backend.exception.HealthProcedureConflictException;
import org.hibernate.exception.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class HealthProcedureDataProviderImpl implements HealthProcedureDataProvider {

  private static final String SCHEDULED_NEUTERING_CONSTRAINT =
      "uq_health_procedures_scheduled_neutering";
  private static final String LIKE_ESCAPE = "!";

  private final HealthProcedureRepository healthProcedureRepository;

  @Override
  public HealthProcedure save(HealthProcedure healthProcedure) {
    try {
      return healthProcedureRepository.saveAndFlush(healthProcedure);
    } catch (DataIntegrityViolationException e) {
      if (violates(e, SCHEDULED_NEUTERING_CONSTRAINT)) {
        throw new HealthProcedureConflictException("Este gato já tem uma castração agendada.");
      }
      throw e;
    }
  }

  @Override
  public Optional<HealthProcedure> findById(Integer id) {
    return healthProcedureRepository.findByIdFetchingDetails(id);
  }

  @Override
  public Optional<HealthProcedure> findByIdForUpdate(Integer id) {
    return healthProcedureRepository.findByIdForUpdate(id);
  }

  @Override
  public PagedResult<HealthProcedure> search(HealthProcedureSearchCriteria criteria) {
    Pageable pageable =
        PageRequest.of(criteria.page(), criteria.size(), sortFor(criteria.status()));

    Page<HealthProcedure> page =
        healthProcedureRepository.search(
            toSearchPattern(criteria.search()),
            criteria.catId(),
            criteria.type(),
            criteria.status(),
            pageable);

    return new PagedResult<>(
        page.getContent(),
        page.getNumber(),
        page.getSize(),
        page.getTotalElements(),
        page.getTotalPages());
  }

  @Override
  public Optional<HealthProcedure> findLastCompleted(Integer catId, HealthProcedureType type) {
    return healthProcedureRepository.findFirstByCatIdAndTypeAndStatusOrderByCompletedDateDesc(
        catId, type, HealthProcedureStatus.Completed);
  }

  @Override
  public Optional<HealthProcedure> findNextScheduled(Integer catId) {
    return healthProcedureRepository.findFirstByCatIdAndStatusOrderByScheduledDateAsc(
        catId, HealthProcedureStatus.Scheduled);
  }

  @Override
  public boolean existsScheduled(Integer catId, HealthProcedureType type) {
    return healthProcedureRepository.existsByCatIdAndTypeAndStatus(
        catId, type, HealthProcedureStatus.Scheduled);
  }

  static String toSearchPattern(String search) {
    if (search == null || search.isBlank()) {
      return null;
    }
    String escaped =
        search
            .trim()
            .toLowerCase()
            .replace(LIKE_ESCAPE, LIKE_ESCAPE + LIKE_ESCAPE)
            .replace("%", LIKE_ESCAPE + "%")
            .replace("_", LIKE_ESCAPE + "_");
    return "%" + escaped + "%";
  }

  private static boolean violates(DataIntegrityViolationException e, String constraint) {
    return e.getCause() instanceof ConstraintViolationException violation
        && constraint.equals(violation.getConstraintName());
  }

  private Sort sortFor(HealthProcedureStatus status) {
    Sort.Direction direction =
        status == HealthProcedureStatus.Scheduled ? Sort.Direction.ASC : Sort.Direction.DESC;
    return Sort.by(direction, "scheduledDate").and(Sort.by(direction, "id"));
  }
}
