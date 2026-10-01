package org.amicats.backend.domain.usecase.stock.read;

import java.time.LocalDate;
import org.amicats.backend.domain.enums.StockStatus;

public record StockItemSearchCriteria(
    String search,
    String category,
    StockStatus status,
    LocalDate expirationFrom,
    LocalDate expirationTo,
    int page,
    int size) {}
