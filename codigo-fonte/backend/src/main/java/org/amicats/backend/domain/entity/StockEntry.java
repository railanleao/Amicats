package org.amicats.backend.domain.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.amicats.backend.domain.enums.StockOrigin;

@Entity
@Table(name = "stock_entries")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class StockEntry {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id_stock_entry")
  private Integer id;

  @ManyToOne(optional = false)
  @JoinColumn(name = "id_stock_item", nullable = false)
  private StockItem stockItem;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 30)
  private StockOrigin origin;

  @Column(name = "donor_name", length = 150)
  private String donorName;

  @Column(nullable = false, precision = 12, scale = 3)
  private BigDecimal quantity;

  @Column(name = "entry_date", nullable = false)
  private LocalDate entryDate;

  @Column(name = "expiration_date")
  private LocalDate expirationDate;

  public StockEntry(
      StockItem stockItem,
      StockOrigin origin,
      String donorName,
      BigDecimal quantity,
      LocalDate entryDate,
      LocalDate expirationDate) {
    this.stockItem = stockItem;
    this.origin = origin;
    this.donorName = donorName;
    this.quantity = quantity;
    this.entryDate = entryDate;
    this.expirationDate = expirationDate;
  }
}
