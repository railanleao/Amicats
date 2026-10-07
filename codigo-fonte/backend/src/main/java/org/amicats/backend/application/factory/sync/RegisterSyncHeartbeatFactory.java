package org.amicats.backend.application.factory.sync;

import lombok.AllArgsConstructor;
import org.amicats.backend.domain.interfaces.dataprovider.sync.SyncDeviceDataProvider;
import org.amicats.backend.domain.interfaces.dataprovider.user.UserDataProvider;
import org.amicats.backend.domain.usecase.sync.device.RegisterSyncHeartbeatUseCase;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Scope;

@Configuration
@AllArgsConstructor
public class RegisterSyncHeartbeatFactory {

  private SyncDeviceDataProvider syncDeviceDataProvider;
  private UserDataProvider userDataProvider;

  @Bean("RegisterSyncHeartbeatUseCase")
  @Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
  public RegisterSyncHeartbeatUseCase create() {
    return RegisterSyncHeartbeatUseCase.builder()
        .syncDeviceDataProvider(syncDeviceDataProvider)
        .userDataProvider(userDataProvider)
        .build();
  }
}
