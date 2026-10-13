package org.amicats.backend.controller.stock;

import jakarta.validation.Valid;
import org.amicats.backend.domain.usecase.common.PagedResult;
import org.amicats.backend.domain.usecase.stock.alert.ChangeMinimumQuantityInput;
import org.amicats.backend.domain.usecase.stock.alert.StockAlertOutput;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

public interface StockAlertController {
  @GetMapping("/dashboard/medication-stock-alerts")
  PagedResult<StockAlertOutput> list(
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size,
      @AuthenticationPrincipal Jwt jwt);

  @PatchMapping("/stock/{id}/minimum-quantity")
  StockAlertOutput changeMinimum(
      @PathVariable Integer id,
      @Valid @RequestBody ChangeMinimumQuantityInput input,
      @AuthenticationPrincipal Jwt jwt);
}
