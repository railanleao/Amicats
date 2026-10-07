package org.amicats.backend.application.factory.sync;

import lombok.AllArgsConstructor;
import org.amicats.backend.domain.interfaces.dataprovider.sync.SyncDeviceDataProvider;
import org.amicats.backend.domain.usecase.sync.device.ListSyncDevicesUseCase;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Scope;

@Configuration
@AllArgsConstructor
public class ListSyncDevicesFactory {

  private SyncDeviceDataProvider syncDeviceDataProvider;

  @Bean("ListSyncDevicesUseCase")
  @Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
  public ListSyncDevicesUseCase create() {
    return ListSyncDevicesUseCase.builder().syncDeviceDataProvider(syncDeviceDataProvider).build();
  }
}
