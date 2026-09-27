package org.amicats.backend.domain.interfaces.dataprovider.stock;

import org.amicats.backend.domain.entity.StockEntry;

import java.util.List;

import java.time.LocalDate;

import java.util.Optional;

public interface StockEntryDataProvider {

  StockEntry save(StockEntry stockEntry);

  List<StockEntry> findByStockItemId(Integer stockItemId);
  Optional<LocalDate> findNearestExpirationDate(
    Integer stockItemId,
    LocalDate today);

}
