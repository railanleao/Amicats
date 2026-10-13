package org.amicats.backend.domain.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.amicats.backend.domain.enums.StockStatus;
import org.amicats.backend.exception.InvalidStockConsumptionException;

@Entity
@Table(name = "stock_items")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class StockItem {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id_stock_item")
  private Integer id;

  @Column(name = "updated_at", insertable = false, updatable = false)
  private LocalDateTime updatedAt;

  @Column(nullable = false, length = 150)
  private String name;

  @Column(nullable = false, length = 50)
  private String category;

  @Column(nullable = false, precision = 12, scale = 3)
  private BigDecimal quantity;

  @Column(name = "minimum_quantity", nullable = false, precision = 12, scale = 3)
  private BigDecimal minimumQuantity = BigDecimal.TEN;

  @Column(nullable = false, length = 30)
  private String unit;

  @Column(columnDefinition = "text")
  private String notes;

  public StockItem(String name, String category, BigDecimal quantity, String unit, String notes) {
    this.name = name;
    this.category = category;
    this.quantity = quantity;
    this.unit = unit;
    this.notes = notes;
  }

  public void updateDetails(String name, String category, String unit, String notes) {
    this.name = name;
    this.category = category;
    this.unit = unit;
    this.notes = notes;
  }

  public void updateQuantity(BigDecimal quantity) {
    this.quantity = quantity;
  }

  public void changeMinimumQuantity(BigDecimal minimumQuantity) {
    if (minimumQuantity == null
        || minimumQuantity.signum() < 0
        || minimumQuantity.stripTrailingZeros().scale() > 3
        || minimumQuantity.compareTo(new BigDecimal("999999999.999")) > 0) {
      throw new InvalidStockConsumptionException("Limite mínimo inválido.");
    }
    this.minimumQuantity = minimumQuantity;
  }

  public void consume(BigDecimal consumedQuantity) {
    if (consumedQuantity == null || consumedQuantity.signum() <= 0) {
      throw new InvalidStockConsumptionException("Consumo deve ser positivo.");
    }
    this.quantity = quantity.subtract(consumedQuantity);
  }

  public StockStatus getStatus() {
    if (quantity == null || quantity.compareTo(BigDecimal.ZERO) <= 0) {
      return StockStatus.OutOfStock;
    }

    if (quantity.compareTo(minimumQuantity) <= 0) {
      return StockStatus.Low;
    }

    return StockStatus.Normal;
  }
}
