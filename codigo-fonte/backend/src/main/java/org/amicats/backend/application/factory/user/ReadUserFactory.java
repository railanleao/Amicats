package org.amicats.backend.application.factory.user;

import lombok.AllArgsConstructor;
import org.amicats.backend.domain.interfaces.dataprovider.user.UserDataProvider;
import org.amicats.backend.domain.usecase.user.read.ReadUserUseCase;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Scope;

@Configuration
@AllArgsConstructor
public class ReadUserFactory {

    private UserDataProvider userDataProvider;

    @Bean("ReadUserUseCase")
    @Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
    public ReadUserUseCase criar() {
        return ReadUserUseCase.builder()
                .userDataProvider(userDataProvider)
                .build();
    }
}