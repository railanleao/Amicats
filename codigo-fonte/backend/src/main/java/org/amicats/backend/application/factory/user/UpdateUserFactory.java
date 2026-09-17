package org.amicats.backend.application.factory.user;

import lombok.AllArgsConstructor;
import org.amicats.backend.domain.interfaces.dataprovider.user.UserDataProvider;
import org.amicats.backend.domain.usecase.user.update.UpdateUserUseCase;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Scope;

@Configuration
@AllArgsConstructor
public class UpdateUserFactory {

    private UserDataProvider userDataProvider;

    @Bean("UpdateUserUseCase")
    @Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
    public UpdateUserUseCase criar() {
        return UpdateUserUseCase.builder()
                .userDataProvider(userDataProvider)
                .build();
    }
}