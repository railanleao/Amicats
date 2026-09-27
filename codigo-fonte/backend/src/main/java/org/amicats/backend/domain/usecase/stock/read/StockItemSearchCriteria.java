package org.amicats.backend.domain.usecase.stock.read;

import org.amicats.backend.domain.enums.StockStatus;
import java.time.LocalDate;

public record StockItemSearchCriteria(
  String search,
  String category,
  StockStatus status,
  LocalDate expirationFrom,
  LocalDate expirationTo,
  int page,
  int size) {}
