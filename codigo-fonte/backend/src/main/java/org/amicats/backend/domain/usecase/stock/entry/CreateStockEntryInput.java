package org.amicats.backend.domain.usecase.stock.entry;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import org.amicats.backend.domain.enums.StockOrigin;

public record CreateStockEntryInput(
    @NotNull Integer stockItemId,
    @NotNull StockOrigin origin,
    @Size(max = 150) String donorName,
    @NotNull @DecimalMin(value = "0.0", inclusive = false) BigDecimal quantity,
    @NotNull LocalDate entryDate,
    LocalDate expirationDate) {}
