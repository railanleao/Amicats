package org.amicats.backend.application.factory.room;

import lombok.AllArgsConstructor;
import org.amicats.backend.domain.interfaces.dataprovider.room.RoomDataProvider;
import org.amicats.backend.domain.usecase.room.status.ChangeRoomStatusUseCase;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Scope;

@Configuration
@AllArgsConstructor
public class ChangeRoomStatusFactory {

  private RoomDataProvider roomDataProvider;

  @Bean("ChangeRoomStatusUseCase")
  @Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
  public ChangeRoomStatusUseCase create() {
    return ChangeRoomStatusUseCase.builder().roomDataProvider(roomDataProvider).build();
  }
}
