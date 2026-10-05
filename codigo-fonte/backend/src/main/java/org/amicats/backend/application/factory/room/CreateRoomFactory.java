package org.amicats.backend.application.factory.room;

import lombok.AllArgsConstructor;
import org.amicats.backend.domain.interfaces.dataprovider.room.RoomDataProvider;
import org.amicats.backend.domain.usecase.room.create.CreateRoomUseCase;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Scope;

@Configuration
@AllArgsConstructor
public class CreateRoomFactory {

  private RoomDataProvider roomDataProvider;

  @Bean("CreateRoomUseCase")
  @Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
  public CreateRoomUseCase create() {
    return CreateRoomUseCase.builder().roomDataProvider(roomDataProvider).build();
  }
}
