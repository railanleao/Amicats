package org.amicats.backend.domain.usecase.cat.read;

import lombok.Builder;
import org.amicats.backend.domain.entity.Cat;
import org.amicats.backend.domain.interfaces.dataprovider.cat.CatDataProvider;
import org.amicats.backend.domain.usecase.common.PagedResult;
import org.amicats.backend.exception.ResourceNotFoundException;
import org.springframework.transaction.annotation.Transactional;

@Builder
public class ReadCatUseCase {

  private static final int MIN_PAGE_SIZE = 1;
  private static final int MAX_PAGE_SIZE = 100;
  private static final int DEFAULT_PAGE_SIZE = 20;

  private CatDataProvider catDataProvider;

  @Transactional(readOnly = true)
  public ReadCatOutput findById(Integer id) {
    Cat cat =
        catDataProvider
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Gato não encontrado: " + id));
    return ReadCatOutput.from(cat);
  }

  @Transactional(readOnly = true)
  public PagedResult<ReadCatOutput> search(CatSearchCriteria criteria) {
    CatSearchCriteria sanitized = sanitize(criteria);

    PagedResult<Cat> result = catDataProvider.search(sanitized);

    return new PagedResult<>(
        result.content().stream().map(ReadCatOutput::from).toList(),
        result.page(),
        result.size(),
        result.totalElements(),
        result.totalPages());
  }

  private CatSearchCriteria sanitize(CatSearchCriteria criteria) {
    int page = Math.max(criteria.page(), 0);
    int size =
        criteria.size() <= 0
            ? DEFAULT_PAGE_SIZE
            : Math.min(Math.max(criteria.size(), MIN_PAGE_SIZE), MAX_PAGE_SIZE);

    return new CatSearchCriteria(
        criteria.search(), criteria.roomId(), criteria.generalStatus(), page, size);
  }
}
