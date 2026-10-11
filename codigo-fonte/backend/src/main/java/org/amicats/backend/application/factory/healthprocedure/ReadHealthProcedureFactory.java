package org.amicats.backend.application.factory.healthprocedure;

import lombok.AllArgsConstructor;
import org.amicats.backend.domain.interfaces.dataprovider.cat.CatDataProvider;
import org.amicats.backend.domain.interfaces.dataprovider.healthprocedure.HealthProcedureDataProvider;
import org.amicats.backend.domain.usecase.healthprocedure.read.ReadHealthProcedureUseCase;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Scope;

@Configuration
@AllArgsConstructor
public class ReadHealthProcedureFactory {

  private HealthProcedureDataProvider healthProcedureDataProvider;
  private CatDataProvider catDataProvider;

  @Bean("ReadHealthProcedureUseCase")
  @Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
  public ReadHealthProcedureUseCase create() {
    return ReadHealthProcedureUseCase.builder()
        .healthProcedureDataProvider(healthProcedureDataProvider)
        .catDataProvider(catDataProvider)
        .build();
  }
}
