package org.amicats.backend.repository.stock;

import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.amicats.backend.domain.entity.StockItem;
import org.amicats.backend.domain.interfaces.dataprovider.stock.StockItemDataProvider;
import org.amicats.backend.domain.usecase.common.PagedResult;
import org.amicats.backend.domain.usecase.stock.read.StockItemSearchCriteria;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class StockItemDataProviderImpl implements StockItemDataProvider {

  private final StockItemRepository stockItemRepository;
  private final EntityManager entityManager;

  @Override
  public Optional<StockItem> findByIdForUpdate(Integer id) {
    var found = stockItemRepository.findByIdForUpdate(id);
    // Refresh if another association already loaded the item before the row lock.
    found.ifPresent(item -> entityManager.refresh(item, LockModeType.PESSIMISTIC_WRITE));
    return found;
  }

  @Override
  public PagedResult<StockItem> findMedicationAlerts(int page, int size) {
    var result = stockItemRepository.findMedicationAlerts(PageRequest.of(page, size));
    return new PagedResult<>(
        result.getContent(),
        result.getNumber(),
        result.getSize(),
        result.getTotalElements(),
        result.getTotalPages());
  }

  @Override
  public StockItem save(StockItem stockItem) {
    return stockItemRepository.save(stockItem);
  }

  @Override
  public Optional<StockItem> findById(Integer id) {
    return stockItemRepository.findById(id);
  }

  @Override
  public PagedResult<StockItem> search(StockItemSearchCriteria criteria) {
    Pageable pageable = PageRequest.of(criteria.page(), criteria.size());

    Page<StockItem> result =
        stockItemRepository.search(
            toSearchPattern(criteria.search()),
            toCategory(criteria.category()),
            criteria.status() == null ? null : criteria.status().name(),
            criteria.expirationFrom() != null,
            criteria.expirationFrom(),
            criteria.expirationTo() != null,
            criteria.expirationTo(),
            LocalDate.now(),
            pageable);

    return new PagedResult<>(
        result.getContent(),
        result.getNumber(),
        result.getSize(),
        result.getTotalElements(),
        result.getTotalPages());
  }

  @Override
  public List<StockItem> findAllByCategory(String category) {
    return stockItemRepository.findAllByCategoryIgnoreCase(category);
  }

  private String toSearchPattern(String search) {
    if (search == null || search.isBlank()) {
      return null;
    }

    return "%" + search.trim().toLowerCase() + "%";
  }

  private String toCategory(String category) {
    if (category == null || category.isBlank()) {
      return null;
    }

    return category.trim().toLowerCase();
  }
}
