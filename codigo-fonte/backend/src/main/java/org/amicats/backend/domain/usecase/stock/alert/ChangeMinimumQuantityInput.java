package org.amicats.backend.domain.usecase.stock.alert;

import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;

public record ChangeMinimumQuantityInput(
    @NotNull @PositiveOrZero @Digits(integer = 9, fraction = 3) BigDecimal minimumQuantity) {}
