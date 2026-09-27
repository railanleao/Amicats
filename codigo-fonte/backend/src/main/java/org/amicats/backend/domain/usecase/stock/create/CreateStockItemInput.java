package org.amicats.backend.domain.usecase.stock.create;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record CreateStockItemInput(
  @NotBlank @Size(max = 150) String name,
  @NotBlank @Size(max = 50) String category,
  @NotNull @DecimalMin(value = "0.0", inclusive = true) BigDecimal quantity,
  @NotBlank @Size(max = 30) String unit,
  String notes) {
}
