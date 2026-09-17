package org.amicats.backend.domain.usecase.user.deactivate;

import lombok.Builder;
import org.amicats.backend.domain.entity.User;
import org.amicats.backend.domain.interfaces.dataprovider.user.UserDataProvider;
import org.amicats.backend.exception.ResourceNotFoundException;
import org.springframework.transaction.annotation.Transactional;

@Builder
public class DeactivateUserUseCase {

    private UserDataProvider userDataProvider;

    @Transactional
    public void execute(Integer id) {
        User user = userDataProvider.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado: " + id));
        user.deactive();
        userDataProvider.saveUser(user);
    }
}