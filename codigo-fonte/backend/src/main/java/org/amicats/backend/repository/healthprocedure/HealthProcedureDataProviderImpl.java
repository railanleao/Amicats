package org.amicats.backend.repository.healthprocedure;

import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.amicats.backend.domain.entity.HealthProcedure;
import org.amicats.backend.domain.enums.HealthProcedureStatus;
import org.amicats.backend.domain.enums.HealthProcedureType;
import org.amicats.backend.domain.interfaces.dataprovider.healthprocedure.HealthProcedureDataProvider;
import org.amicats.backend.domain.usecase.common.PagedResult;
import org.amicats.backend.domain.usecase.healthprocedure.read.HealthProcedureSearchCriteria;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class HealthProcedureDataProviderImpl implements HealthProcedureDataProvider {

  private final HealthProcedureRepository healthProcedureRepository;

  @Override
  public HealthProcedure save(HealthProcedure healthProcedure) {
    return healthProcedureRepository.save(healthProcedure);
  }

  @Override
  public Optional<HealthProcedure> findById(Integer id) {
    return healthProcedureRepository.findByIdFetchingDetails(id);
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

  private Sort sortFor(HealthProcedureStatus status) {
    Sort.Direction direction =
        status == HealthProcedureStatus.Scheduled ? Sort.Direction.ASC : Sort.Direction.DESC;
    return Sort.by(direction, "scheduledDate").and(Sort.by(direction, "id"));
  }

  private String toSearchPattern(String search) {
    if (search == null || search.isBlank()) {
      return null;
    }
    return "%" + search.trim().toLowerCase() + "%";
  }

  @Override
  public boolean existsScheduled(Integer catId, HealthProcedureType type) {
    return healthProcedureRepository.existsByCatIdAndTypeAndStatus(
        catId, type, HealthProcedureStatus.Scheduled);
  }
}
