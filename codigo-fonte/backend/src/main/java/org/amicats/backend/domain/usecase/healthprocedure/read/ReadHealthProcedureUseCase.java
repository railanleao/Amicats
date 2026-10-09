package org.amicats.backend.domain.usecase.healthprocedure.read;

import java.time.Clock;
import java.time.LocalDate;
import java.util.List;
import lombok.Builder;
import org.amicats.backend.domain.entity.Cat;
import org.amicats.backend.domain.entity.HealthProcedure;
import org.amicats.backend.domain.enums.HealthProcedureType;
import org.amicats.backend.domain.interfaces.dataprovider.cat.CatDataProvider;
import org.amicats.backend.domain.interfaces.dataprovider.healthprocedure.HealthProcedureDataProvider;
import org.amicats.backend.domain.usecase.common.BusinessCalendar;
import org.amicats.backend.domain.usecase.common.PagedResult;
import org.amicats.backend.exception.ResourceNotFoundException;
import org.springframework.transaction.annotation.Transactional;

@Builder
public class ReadHealthProcedureUseCase {

  private static final int MIN_PAGE_SIZE = 1;
  private static final int MAX_PAGE_SIZE = 100;
  private static final int DEFAULT_PAGE_SIZE = 20;

  private HealthProcedureDataProvider healthProcedureDataProvider;
  private CatDataProvider catDataProvider;
  @Builder.Default private Clock clock = Clock.systemUTC();

  @Transactional(readOnly = true)
  public ReadHealthProcedureOutput findById(Integer id) {
    return ReadHealthProcedureOutput.from(find(id), BusinessCalendar.today(clock));
  }

  @Transactional(readOnly = true)
  public PagedResult<ReadHealthProcedureOutput> search(HealthProcedureSearchCriteria criteria) {
    LocalDate today = BusinessCalendar.today(clock);
    PagedResult<HealthProcedure> result = healthProcedureDataProvider.search(sanitize(criteria));

    return new PagedResult<>(
        result.content().stream().map(h -> ReadHealthProcedureOutput.from(h, today)).toList(),
        result.page(),
        result.size(),
        result.totalElements(),
        result.totalPages());
  }

  @Transactional(readOnly = true)
  public List<ReadHealthProcedureChangeOutput> listChanges(Integer id) {
    return find(id).getChanges().stream().map(ReadHealthProcedureChangeOutput::from).toList();
  }

  @Transactional(readOnly = true)
  public CatHealthSummaryOutput summarize(Integer catId) {
    Cat cat =
        catDataProvider
            .findById(catId)
            .orElseThrow(() -> new ResourceNotFoundException("Gato não encontrado."));
    LocalDate today = BusinessCalendar.today(clock);

    return new CatHealthSummaryOutput(
        cat.getId(),
        cat.getNeuteringStatus(),
        cat.getNeuteringDate(),
        lastCompleted(catId, HealthProcedureType.Vaccine, today),
        lastCompleted(catId, HealthProcedureType.Deworming, today),
        healthProcedureDataProvider
            .findNextScheduled(catId)
            .map(h -> ReadHealthProcedureOutput.from(h, today))
            .orElse(null));
  }

  private ReadHealthProcedureOutput lastCompleted(
      Integer catId, HealthProcedureType type, LocalDate today) {
    return healthProcedureDataProvider
        .findLastCompleted(catId, type)
        .map(h -> ReadHealthProcedureOutput.from(h, today))
        .orElse(null);
  }

  private HealthProcedure find(Integer id) {
    return healthProcedureDataProvider
        .findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Agendamento não encontrado."));
  }

  private HealthProcedureSearchCriteria sanitize(HealthProcedureSearchCriteria criteria) {
    int page = Math.max(criteria.page(), 0);
    int size =
        criteria.size() <= 0
            ? DEFAULT_PAGE_SIZE
            : Math.min(Math.max(criteria.size(), MIN_PAGE_SIZE), MAX_PAGE_SIZE);

    return new HealthProcedureSearchCriteria(
        criteria.search(), criteria.catId(), criteria.type(), criteria.status(), page, size);
  }
}
