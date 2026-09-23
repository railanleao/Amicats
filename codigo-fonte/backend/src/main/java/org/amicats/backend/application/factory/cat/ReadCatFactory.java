package org.amicats.backend.application.factory.cat;

import lombok.AllArgsConstructor;
import org.amicats.backend.domain.interfaces.dataprovider.cat.CatDataProvider;
import org.amicats.backend.domain.usecase.cat.read.ReadCatUseCase;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Scope;

@Configuration
@AllArgsConstructor
public class ReadCatFactory {

  private CatDataProvider catDataProvider;

  @Bean("ReadCatUseCase")
  @Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
  public ReadCatUseCase create() {
    return ReadCatUseCase.builder().catDataProvider(catDataProvider).build();
  }
}
