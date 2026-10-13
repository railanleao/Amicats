package org.amicats.backend.domain.usecase.stock.alert;

import java.math.BigDecimal;
import org.amicats.backend.domain.entity.StockItem;
import org.amicats.backend.domain.enums.StockStatus;

public record StockAlertOutput(
    Integer stockItemId,
    String medicationName,
    BigDecimal quantity,
    String unit,
    BigDecimal minimumQuantity,
    StockStatus status,
    boolean needsReconciliation) {

  public static StockAlertOutput from(StockItem item) {
    return new StockAlertOutput(
        item.getId(),
        item.getName(),
        item.getQuantity(),
        item.getUnit(),
        item.getMinimumQuantity(),
        item.getStatus(),
        item.getQuantity().signum() < 0);
  }
}
