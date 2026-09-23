package org.amicats.backend.application.factory.cat;

import lombok.AllArgsConstructor;
import org.amicats.backend.domain.interfaces.dataprovider.cat.CatDataProvider;
import org.amicats.backend.domain.interfaces.storage.PhotoStorage;
import org.amicats.backend.domain.usecase.cat.photo.CatPhotoUseCase;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Scope;

@Configuration
@AllArgsConstructor
public class CatPhotoFactory {

  private CatDataProvider catDataProvider;
  private PhotoStorage photoStorage;

  @Bean("CatPhotoUseCase")
  @Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
  public CatPhotoUseCase create() {
    return CatPhotoUseCase.builder()
        .catDataProvider(catDataProvider)
        .photoStorage(photoStorage)
        .build();
  }
}
