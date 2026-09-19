package org.amicats.backend.application.factory.user;

import lombok.AllArgsConstructor;
import org.amicats.backend.domain.interfaces.dataprovider.user.UserDataProvider;
import org.amicats.backend.domain.interfaces.storage.PhotoStorage;
import org.amicats.backend.domain.usecase.user.photo.UserPhotoUseCase;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Scope;

@Configuration
@AllArgsConstructor
public class UserPhotoFactory {

  private UserDataProvider userDataProvider;
  private PhotoStorage photoStorage;

  @Bean("UserPhotoUseCase")
  @Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
  public UserPhotoUseCase create() {
    return UserPhotoUseCase.builder()
        .userDataProvider(userDataProvider)
        .photoStorage(photoStorage)
        .build();
  }
}
