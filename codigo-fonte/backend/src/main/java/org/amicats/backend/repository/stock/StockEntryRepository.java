package org.amicats.backend.repository.stock;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.amicats.backend.domain.entity.StockEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface StockEntryRepository extends JpaRepository<StockEntry, Integer> {

  List<StockEntry> findByStockItemId(Integer stockItemId);

  @Query(
      """
      select min(se.expirationDate)
      from StockEntry se
      where se.stockItem.id = :stockItemId
        and se.expirationDate is not null
        and se.expirationDate >= :today
      """)
  Optional<LocalDate> findNearestExpirationDate(
      @Param("stockItemId") Integer stockItemId, @Param("today") LocalDate today);
}
