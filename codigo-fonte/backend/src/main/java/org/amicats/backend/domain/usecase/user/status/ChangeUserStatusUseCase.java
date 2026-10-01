package org.amicats.backend.domain.usecase.user.status;

import lombok.Builder;
import org.amicats.backend.domain.entity.User;
import org.amicats.backend.domain.interfaces.dataprovider.user.UserDataProvider;
import org.amicats.backend.exception.ResourceNotFoundException;
import org.amicats.backend.exception.SelfActionNotAllowedException;
import org.springframework.transaction.annotation.Transactional;

@Builder
public class ChangeUserStatusUseCase {

  private UserDataProvider userDataProvider;

  @Transactional
  public void execute(Integer id, boolean active, Integer actingUserId) {
    User user =
        userDataProvider
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado: " + id));

    if (!active && id.equals(actingUserId)) {
      throw new SelfActionNotAllowedException("Você não pode desativar a sua própria conta.");
    }

    if (active) {
      user.activate();
    } else {
      user.deactivate();
    }
    userDataProvider.saveUser(user);
  }
}
