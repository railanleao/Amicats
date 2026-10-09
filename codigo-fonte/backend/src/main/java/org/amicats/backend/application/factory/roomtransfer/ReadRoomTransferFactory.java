package org.amicats.backend.application.factory.roomtransfer;

import lombok.AllArgsConstructor;
import org.amicats.backend.domain.interfaces.dataprovider.cat.CatDataProvider;
import org.amicats.backend.domain.interfaces.dataprovider.roomtransfer.RoomTransferDataProvider;
import org.amicats.backend.domain.usecase.roomtransfer.read.ReadRoomTransferUseCase;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Scope;

@Configuration
@AllArgsConstructor
public class ReadRoomTransferFactory {

  private CatDataProvider catDataProvider;
  private RoomTransferDataProvider roomTransferDataProvider;

  @Bean("ReadRoomTransferUseCase")
  @Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
  public ReadRoomTransferUseCase create() {
    return ReadRoomTransferUseCase.builder()
        .catDataProvider(catDataProvider)
        .roomTransferDataProvider(roomTransferDataProvider)
        .build();
  }
}
