package org.amicats.backend.domain.usecase.stock.update;

import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record UpdateStockItemInput(
    @NotBlank @Size(max = 150) String name,
    @NotBlank @Size(max = 50) String category,
    @NotNull @Digits(integer = 9, fraction = 3) BigDecimal quantity,
    @NotBlank @Size(max = 30) String unit,
    String notes,
    @NotNull BigDecimal expectedQuantity) {}
