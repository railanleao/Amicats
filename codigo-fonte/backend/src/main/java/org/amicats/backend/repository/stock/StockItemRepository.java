package org.amicats.backend.repository.stock;

import org.amicats.backend.domain.entity.StockItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;

public interface StockItemRepository
  extends JpaRepository<StockItem, Integer> {

  @Query(
    "select s from StockItem s where "
      + "(:searchPattern is null or lower(s.name) like :searchPattern) "
      + "and (:category is null or lower(s.category) = :category) "
      + "and ("
      + ":status is null "
      + "or (:status = 'OutOfStock' and s.quantity <= 0) "
      + "or (:status = 'Low' and s.quantity > 0 and s.quantity <= 10) "
      + "or (:status = 'Normal' and s.quantity > 10)"
      + ") "
      + "and (:filterExpirationFrom = false or "
      + "(select min(se.expirationDate) from StockEntry se "
      + "where se.stockItem.id = s.id "
      + "and se.expirationDate is not null "
      + "and se.expirationDate >= :today) >= :expirationFrom) "
      + "and (:filterExpirationTo = false or "
      + "(select min(se.expirationDate) from StockEntry se "
      + "where se.stockItem.id = s.id "
      + "and se.expirationDate is not null "
      + "and se.expirationDate >= :today) <= :expirationTo) "
      + "order by "
      + "case "
      + "when s.quantity <= 0 then 0 "
      + "when s.quantity <= 10 then 1 "
      + "else 2 "
      + "end, "
      + "(select min(se3.expirationDate) from StockEntry se3 "
      + "where se3.stockItem.id = s.id "
      + "and se3.expirationDate is not null "
      + "and se3.expirationDate >= :today), "
      + "lower(s.name)")

  Page<StockItem> search(
    @Param("searchPattern") String searchPattern,
    @Param("category") String category,
    @Param("status") String status,
    @Param("filterExpirationFrom") boolean filterExpirationFrom,
    @Param("expirationFrom") LocalDate expirationFrom,
    @Param("filterExpirationTo") boolean filterExpirationTo,
    @Param("expirationTo") LocalDate expirationTo,
    @Param("today") LocalDate today,
    Pageable pageable);

}
