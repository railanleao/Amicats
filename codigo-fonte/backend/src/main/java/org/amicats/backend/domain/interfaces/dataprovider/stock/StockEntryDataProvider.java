package org.amicats.backend.domain.interfaces.dataprovider.stock;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.amicats.backend.domain.entity.StockEntry;

public interface StockEntryDataProvider {

  StockEntry save(StockEntry stockEntry);

  List<StockEntry> findByStockItemId(Integer stockItemId);

  Optional<LocalDate> findNearestExpirationDate(Integer stockItemId, LocalDate today);
}
