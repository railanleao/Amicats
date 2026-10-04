package org.amicats.backend.application.factory.room;

import lombok.AllArgsConstructor;
import org.amicats.backend.domain.interfaces.dataprovider.room.RoomDataProvider;
import org.amicats.backend.domain.usecase.room.update.UpdateRoomUseCase;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Scope;

@Configuration
@AllArgsConstructor
public class UpdateRoomFactory {

  private RoomDataProvider roomDataProvider;

  @Bean("UpdateRoomUseCase")
  @Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
  public UpdateRoomUseCase create() {
    return UpdateRoomUseCase.builder().roomDataProvider(roomDataProvider).build();
  }
}
