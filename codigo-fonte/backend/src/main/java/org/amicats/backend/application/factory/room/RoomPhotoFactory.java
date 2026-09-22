package org.amicats.backend.application.factory.room;

import lombok.AllArgsConstructor;
import org.amicats.backend.domain.interfaces.dataprovider.room.RoomDataProvider;
import org.amicats.backend.domain.interfaces.storage.PhotoStorage;
import org.amicats.backend.domain.usecase.room.photo.RoomPhotoUseCase;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Scope;

@Configuration
@AllArgsConstructor
public class RoomPhotoFactory {

  private RoomDataProvider roomDataProvider;
  private PhotoStorage photoStorage;

  @Bean("RoomPhotoUseCase")
  @Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
  public RoomPhotoUseCase create() {
    return RoomPhotoUseCase.builder()
        .roomDataProvider(roomDataProvider)
        .photoStorage(photoStorage)
        .build();
  }
}
