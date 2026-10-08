package org.amicats.backend.application.factory.sync;

import lombok.AllArgsConstructor;
import org.amicats.backend.domain.interfaces.dataprovider.stock.StockEntryDataProvider;
import org.amicats.backend.domain.interfaces.dataprovider.sync.SyncChangesDataProvider;
import org.amicats.backend.domain.usecase.sync.pull.ReadSyncChangesUseCase;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Scope;

@Configuration
@AllArgsConstructor
public class ReadSyncChangesFactory {

  private SyncChangesDataProvider syncChangesDataProvider;
  private StockEntryDataProvider stockEntryDataProvider;

  @Bean("ReadSyncChangesUseCase")
  @Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
  public ReadSyncChangesUseCase create() {
    return ReadSyncChangesUseCase.builder()
        .syncChangesDataProvider(syncChangesDataProvider)
        .stockEntryDataProvider(stockEntryDataProvider)
        .build();
  }
}
