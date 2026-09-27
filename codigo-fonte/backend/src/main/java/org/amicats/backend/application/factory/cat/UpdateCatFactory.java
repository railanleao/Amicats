package org.amicats.backend.application.factory.cat;

import lombok.AllArgsConstructor;
import org.amicats.backend.domain.interfaces.dataprovider.cat.CatDataProvider;
import org.amicats.backend.domain.interfaces.dataprovider.room.RoomDataProvider;
import org.amicats.backend.domain.usecase.cat.update.UpdateCatUseCase;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Scope;

@Configuration
@AllArgsConstructor
public class UpdateCatFactory {

  private CatDataProvider catDataProvider;
  private RoomDataProvider roomDataProvider;

  @Bean("UpdateCatUseCase")
  @Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
  public UpdateCatUseCase create() {
    return UpdateCatUseCase.builder()
        .catDataProvider(catDataProvider)
        .roomDataProvider(roomDataProvider)
        .build();
  }
}
