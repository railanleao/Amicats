package org.amicats.backend.application.factory.sync;

import java.time.Clock;
import java.time.ZoneId;
import lombok.RequiredArgsConstructor;
import org.amicats.backend.domain.interfaces.dataprovider.stock.StockEntryDataProvider;
import org.amicats.backend.domain.interfaces.dataprovider.sync.SyncChangesDataProvider;
import org.amicats.backend.domain.usecase.sync.pull.ReadSyncChangesUseCase;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Scope;

@Configuration
@RequiredArgsConstructor
public class ReadSyncChangesFactory {

  private final SyncChangesDataProvider syncChangesDataProvider;
  private final StockEntryDataProvider stockEntryDataProvider;

  @Value("${app.clinical-time-zone:America/Sao_Paulo}")
  private String clinicalTimeZone;

  @Bean("ReadSyncChangesUseCase")
  @Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
  public ReadSyncChangesUseCase create() {
    return ReadSyncChangesUseCase.builder()
        .syncChangesDataProvider(syncChangesDataProvider)
        .stockEntryDataProvider(stockEntryDataProvider)
        .clock(Clock.systemUTC())
        .clinicalZone(ZoneId.of(clinicalTimeZone))
        .build();
  }
}
