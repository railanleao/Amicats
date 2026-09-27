package org.amicats.backend.domain.usecase.stock.read;

import org.amicats.backend.domain.entity.StockItem;

import java.math.BigDecimal;

import org.amicats.backend.domain.enums.StockStatus;

import java.time.LocalDate;

public record ReadStockItemOutput(
  Integer id,
  String name,
  String category,
  BigDecimal quantity,
  StockStatus status,
  LocalDate expirationDate,
  String unit,
  String notes) {

  public static ReadStockItemOutput from(StockItem stockItem) {
    return from(stockItem, null);
  }

  public static ReadStockItemOutput from(
    StockItem stockItem,
    LocalDate expirationDate) {

    return new ReadStockItemOutput(
      stockItem.getId(),
      stockItem.getName(),
      stockItem.getCategory(),
      stockItem.getQuantity(),
      stockItem.getStatus(),
      expirationDate,
      stockItem.getUnit(),
      stockItem.getNotes());
  }
}
