package org.amicats.backend.domain.usecase.stock.read;

import java.time.LocalDate;
import lombok.Builder;
import org.amicats.backend.domain.entity.StockItem;
import org.amicats.backend.domain.interfaces.dataprovider.stock.StockEntryDataProvider;
import org.amicats.backend.domain.interfaces.dataprovider.stock.StockItemDataProvider;
import org.amicats.backend.domain.usecase.common.PagedResult;
import org.amicats.backend.exception.ResourceNotFoundException;
import org.springframework.transaction.annotation.Transactional;

@Builder
public class ReadStockItemUseCase {

  private static final int MIN_PAGE_SIZE = 1;
  private static final int MAX_PAGE_SIZE = 100;
  private static final int DEFAULT_PAGE_SIZE = 20;
  private StockItemDataProvider stockItemDataProvider;
  private StockEntryDataProvider stockEntryDataProvider;

  @Transactional(readOnly = true)
  public ReadStockItemOutput findById(Integer id) {
    StockItem stockItem =
        stockItemDataProvider
            .findById(id)
            .orElseThrow(
                () -> new ResourceNotFoundException("Item de estoque não encontrado: " + id));

    LocalDate expirationDate =
        stockEntryDataProvider.findNearestExpirationDate(id, LocalDate.now()).orElse(null);

    return ReadStockItemOutput.from(stockItem, expirationDate);
  }

  @Transactional(readOnly = true)
  public PagedResult<ReadStockItemOutput> search(StockItemSearchCriteria criteria) {

    StockItemSearchCriteria sanitized = sanitize(criteria);

    PagedResult<StockItem> result = stockItemDataProvider.search(sanitized);

    LocalDate today = LocalDate.now();

    return new PagedResult<>(
        result.content().stream()
            .map(
                stockItem -> {
                  LocalDate expirationDate =
                      stockEntryDataProvider
                          .findNearestExpirationDate(stockItem.getId(), today)
                          .orElse(null);

                  return ReadStockItemOutput.from(stockItem, expirationDate);
                })
            .toList(),
        result.page(),
        result.size(),
        result.totalElements(),
        result.totalPages());
  }

  private StockItemSearchCriteria sanitize(StockItemSearchCriteria criteria) {

    int page = Math.max(criteria.page(), 0);

    int size =
        criteria.size() <= 0
            ? DEFAULT_PAGE_SIZE
            : Math.min(Math.max(criteria.size(), MIN_PAGE_SIZE), MAX_PAGE_SIZE);

    return new StockItemSearchCriteria(
        criteria.search(),
        criteria.category(),
        criteria.status(),
        criteria.expirationFrom(),
        criteria.expirationTo(),
        page,
        size);
  }
}
