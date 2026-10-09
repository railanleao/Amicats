package org.amicats.backend.application.factory.roomtransfer;

import lombok.AllArgsConstructor;
import org.amicats.backend.domain.interfaces.dataprovider.cat.CatDataProvider;
import org.amicats.backend.domain.interfaces.dataprovider.room.RoomDataProvider;
import org.amicats.backend.domain.interfaces.dataprovider.roomtransfer.RoomTransferDataProvider;
import org.amicats.backend.domain.usecase.roomtransfer.create.CreateRoomTransferUseCase;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Scope;

@Configuration
@AllArgsConstructor
public class CreateRoomTransferFactory {

  private CatDataProvider catDataProvider;
  private RoomDataProvider roomDataProvider;
  private RoomTransferDataProvider roomTransferDataProvider;

  @Bean("CreateRoomTransferUseCase")
  @Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
  public CreateRoomTransferUseCase create() {
    return CreateRoomTransferUseCase.builder()
        .catDataProvider(catDataProvider)
        .roomDataProvider(roomDataProvider)
        .roomTransferDataProvider(roomTransferDataProvider)
        .build();
  }
}
