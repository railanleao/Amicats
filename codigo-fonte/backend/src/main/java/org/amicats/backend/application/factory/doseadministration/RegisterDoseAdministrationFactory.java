package org.amicats.backend.application.factory.doseadministration;

import lombok.RequiredArgsConstructor;
import org.amicats.backend.domain.interfaces.dataprovider.doseadministration.DoseAdministrationDataProvider;
import org.amicats.backend.domain.interfaces.dataprovider.user.UserDataProvider;
import org.amicats.backend.domain.usecase.doseadministration.register.RegisterDoseAdministrationUseCase;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Scope;

@Configuration
@RequiredArgsConstructor
public class RegisterDoseAdministrationFactory {
  private final DoseAdministrationDataProvider doseAdministrationDataProvider;
  private final UserDataProvider userDataProvider;

  @Bean("RegisterDoseAdministrationUseCase")
  @Scope(ConfigurableBeanFactory.SCOPE_PROTOTYPE)
  public RegisterDoseAdministrationUseCase create() {
    return RegisterDoseAdministrationUseCase.builder()
        .doseAdministrationDataProvider(doseAdministrationDataProvider)
        .userDataProvider(userDataProvider).build();
  }
}
