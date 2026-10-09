package org.amicats.backend.application.factory.healthprocedure;

import lombok.AllArgsConstructor;
import org.amicats.backend.domain.interfaces.dataprovider.healthprocedure.HealthProcedureDataProvider;
import org.amicats.backend.domain.interfaces.dataprovider.user.UserDataProvider;
import org.amicats.backend.domain.usecase.healthprocedure.update.UpdateHealthProcedureUseCase;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Scope;

@Configuration
@AllArgsConstructor
public class UpdateHealthProcedureFactory {

  private HealthProcedureDataProvider healthProcedureDataProvider;
  private UserDataProvider userDataProvider;

  @Bean("UpdateHealthProcedureUseCase")
  @Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
  public UpdateHealthProcedureUseCase create() {
    return UpdateHealthProcedureUseCase.builder()
        .healthProcedureDataProvider(healthProcedureDataProvider)
        .userDataProvider(userDataProvider)
        .build();
  }
}
