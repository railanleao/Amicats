package org.amicats.backend.application.factory.room;

import lombok.AllArgsConstructor;
import org.amicats.backend.domain.interfaces.dataprovider.room.RoomDataProvider;
import org.amicats.backend.domain.usecase.room.read.ReadRoomUseCase;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Scope;

@Configuration
@AllArgsConstructor
public class ReadRoomFactory {

  private RoomDataProvider roomDataProvider;

  @Bean("ReadRoomUseCase")
  @Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
  public ReadRoomUseCase create() {
    return ReadRoomUseCase.builder().roomDataProvider(roomDataProvider).build();
  }
}
