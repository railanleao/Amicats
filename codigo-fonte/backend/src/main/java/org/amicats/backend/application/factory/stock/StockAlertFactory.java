package org.amicats.backend.application.factory.stock;

import lombok.RequiredArgsConstructor;
import org.amicats.backend.domain.interfaces.dataprovider.stock.StockItemDataProvider;
import org.amicats.backend.domain.interfaces.dataprovider.user.UserDataProvider;
import org.amicats.backend.domain.usecase.stock.alert.StockAlertUseCase;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Scope;

@Configuration
@RequiredArgsConstructor
public class StockAlertFactory {

  private final StockItemDataProvider stockItemDataProvider;
  private final UserDataProvider userDataProvider;

  @Bean("StockAlertUseCase")
  @Scope(ConfigurableBeanFactory.SCOPE_PROTOTYPE)
  public StockAlertUseCase create() {
    return StockAlertUseCase.builder()
        .stockItemDataProvider(stockItemDataProvider)
        .userDataProvider(userDataProvider)
        .build();
  }
}
