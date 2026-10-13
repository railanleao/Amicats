package org.amicats.backend.domain.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "stock_consumptions")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class StockConsumption {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id_stock_consumption")
  private Integer id;

  @OneToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "id_dose_administration", nullable = false, unique = true, updatable = false)
  private DoseAdministration dose;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "id_stock_item", nullable = false, updatable = false)
  private StockItem stockItem;

  @Column(nullable = false, precision = 12, scale = 3, updatable = false)
  private BigDecimal quantity;

  @Column(nullable = false, length = 30, updatable = false)
  private String unit;

  @Column(name = "balance_before", nullable = false, precision = 12, scale = 3, updatable = false)
  private BigDecimal balanceBefore;

  @Column(name = "balance_after", nullable = false, precision = 12, scale = 3, updatable = false)
  private BigDecimal balanceAfter;

  @Column(name = "recorded_at", nullable = false, updatable = false)
  private LocalDateTime recordedAt;

  public StockConsumption(
      DoseAdministration dose, StockItem item, BigDecimal balanceBefore, BigDecimal balanceAfter) {
    this.dose = dose;
    this.stockItem = item;
    this.quantity = dose.getConsumedQuantity();
    this.unit = dose.getConsumedUnit();
    this.balanceBefore = balanceBefore;
    this.balanceAfter = balanceAfter;
    this.recordedAt = dose.getRecordedAt();
  }
}
