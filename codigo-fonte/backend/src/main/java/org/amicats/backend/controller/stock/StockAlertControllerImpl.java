package org.amicats.backend.controller.stock;

import lombok.RequiredArgsConstructor;
import org.amicats.backend.application.factory.stock.StockAlertFactory;
import org.amicats.backend.domain.usecase.common.PagedResult;
import org.amicats.backend.domain.usecase.stock.alert.ChangeMinimumQuantityInput;
import org.amicats.backend.domain.usecase.stock.alert.StockAlertOutput;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class StockAlertControllerImpl implements StockAlertController {
  private final StockAlertFactory factory;

  @Override
  @PreAuthorize("hasAnyRole('Administrator', 'Assistant', 'Veterinarian')")
  public PagedResult<StockAlertOutput> list(int page, int size, Jwt jwt) {
    return factory.create().list(Integer.valueOf(jwt.getSubject()), page, size);
  }

  @Override
  @PreAuthorize("hasAnyRole('Administrator', 'Assistant')")
  public StockAlertOutput changeMinimum(Integer id, ChangeMinimumQuantityInput input, Jwt jwt) {
    return factory.create().changeMinimum(id, Integer.valueOf(jwt.getSubject()), input);
  }
}
