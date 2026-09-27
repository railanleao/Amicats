package org.amicats.backend.repository.stock;

import lombok.RequiredArgsConstructor;
import org.amicats.backend.domain.entity.StockEntry;
import org.amicats.backend.domain.interfaces.dataprovider.stock.StockEntryDataProvider;
import org.springframework.stereotype.Component;

import java.util.List;

import java.time.LocalDate;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class StockEntryDataProviderImpl implements StockEntryDataProvider {

  private final StockEntryRepository stockEntryRepository;

  @Override
  public StockEntry save(StockEntry stockEntry) {
    return stockEntryRepository.save(stockEntry);
  }

  @Override
  public List<StockEntry> findByStockItemId(Integer stockItemId) {
    return stockEntryRepository.findByStockItemId(stockItemId);
  }

  @Override
  public Optional<LocalDate> findNearestExpirationDate(
    Integer stockItemId,
    LocalDate today) {
    return stockEntryRepository.findNearestExpirationDate(
      stockItemId,
      today);
  }
}
