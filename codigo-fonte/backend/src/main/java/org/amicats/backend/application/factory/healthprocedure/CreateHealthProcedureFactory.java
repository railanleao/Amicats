package org.amicats.backend.application.factory.healthprocedure;

import lombok.AllArgsConstructor;
import org.amicats.backend.domain.interfaces.dataprovider.cat.CatDataProvider;
import org.amicats.backend.domain.interfaces.dataprovider.healthprocedure.HealthProcedureDataProvider;
import org.amicats.backend.domain.interfaces.dataprovider.user.UserDataProvider;
import org.amicats.backend.domain.usecase.healthprocedure.create.CreateHealthProcedureUseCase;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Scope;

@Configuration
@AllArgsConstructor
public class CreateHealthProcedureFactory {

  private HealthProcedureDataProvider healthProcedureDataProvider;
  private CatDataProvider catDataProvider;
  private UserDataProvider userDataProvider;

  @Bean("CreateHealthProcedureUseCase")
  @Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
  public CreateHealthProcedureUseCase create() {
    return CreateHealthProcedureUseCase.builder()
        .healthProcedureDataProvider(healthProcedureDataProvider)
        .catDataProvider(catDataProvider)
        .userDataProvider(userDataProvider)
        .build();
  }
}
