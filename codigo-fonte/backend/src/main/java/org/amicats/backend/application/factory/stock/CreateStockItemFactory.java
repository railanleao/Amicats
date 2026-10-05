package org.amicats.backend.application.factory.stock;

import lombok.AllArgsConstructor;
import org.amicats.backend.domain.interfaces.dataprovider.stock.StockItemDataProvider;
import org.amicats.backend.domain.usecase.stock.create.CreateStockItemUseCase;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Scope;

@Configuration
@AllArgsConstructor
public class CreateStockItemFactory {

  private StockItemDataProvider stockItemDataProvider;

  @Bean("CreateStockItemUseCase")
  @Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
  public CreateStockItemUseCase create() {
    return CreateStockItemUseCase.builder().stockItemDataProvider(stockItemDataProvider).build();
  }
}
