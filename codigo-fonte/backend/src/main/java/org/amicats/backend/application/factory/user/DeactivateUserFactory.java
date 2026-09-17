package org.amicats.backend.application.factory.user;

import lombok.AllArgsConstructor;
import org.amicats.backend.domain.interfaces.dataprovider.user.UserDataProvider;
import org.amicats.backend.domain.usecase.user.deactivate.DeactivateUserUseCase;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Scope;

@Configuration
@AllArgsConstructor
public class DeactivateUserFactory {

    private UserDataProvider userDataProvider;

    @Bean("DeactivateUserUseCase")
    @Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
    public DeactivateUserUseCase criar() {
        return DeactivateUserUseCase.builder()
                .userDataProvider(userDataProvider)
                .build();
    }
}