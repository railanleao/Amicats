package org.amicats.backend.application.factory.stock;

import lombok.AllArgsConstructor;
import org.amicats.backend.domain.interfaces.dataprovider.stock.StockEntryDataProvider;
import org.amicats.backend.domain.interfaces.dataprovider.stock.StockItemDataProvider;
import org.amicats.backend.domain.usecase.stock.update.UpdateStockItemUseCase;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Scope;

@Configuration
@AllArgsConstructor
public class UpdateStockItemFactory {

  private StockItemDataProvider stockItemDataProvider;
  private StockEntryDataProvider stockEntryDataProvider;

  @Bean("UpdateStockItemUseCase")
  @Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
  public UpdateStockItemUseCase create() {
    return UpdateStockItemUseCase.builder()
      .stockItemDataProvider(stockItemDataProvider)
      .stockEntryDataProvider(stockEntryDataProvider)
      .build();
  }
}
