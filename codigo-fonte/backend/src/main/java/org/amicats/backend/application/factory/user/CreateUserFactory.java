package org.amicats.backend.application.factory.user;

import lombok.AllArgsConstructor;
import org.amicats.backend.domain.interfaces.dataprovider.user.UserDataProvider;
import org.amicats.backend.domain.usecase.user.create.CreateUserUseCase;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Scope;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@AllArgsConstructor
public class CreateUserFactory {

  private UserDataProvider userDataProvider;
  private PasswordEncoder passwordEncoder;

  @Bean("CreateUserUseCase")
  @Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
  public CreateUserUseCase create() {
    return CreateUserUseCase.builder()
        .userDataProvider(userDataProvider)
        .passwordEncoder(passwordEncoder)
        .build();
  }
}
