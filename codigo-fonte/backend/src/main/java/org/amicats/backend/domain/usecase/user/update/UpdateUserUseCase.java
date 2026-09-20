package org.amicats.backend.domain.usecase.user.update;

import lombok.Builder;
import org.amicats.backend.domain.entity.User;
import org.amicats.backend.domain.interfaces.dataprovider.user.UserDataProvider;
import org.amicats.backend.domain.usecase.user.common.CrmvRule;
import org.amicats.backend.domain.usecase.user.read.ReadUserOutput;
import org.amicats.backend.exception.ResourceNotFoundException;
import org.amicats.backend.exception.SelfActionNotAllowedException;
import org.springframework.transaction.annotation.Transactional;

@Builder
public class UpdateUserUseCase {

  private UserDataProvider userDataProvider;

  @Transactional
  public ReadUserOutput execute(Integer id, UpdateUserInput input, Integer actingUserId) {
    User user =
        userDataProvider
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado: " + id));

    if (id.equals(actingUserId) && user.getAccessType() != input.accessType()) {
      throw new SelfActionNotAllowedException(
          "Você não pode alterar o seu próprio tipo de acesso.");
    }

    user.updateProfile(
        input.fullName(),
        CrmvRule.blankToNull(input.phoneNumber()),
        input.accessType(),
        CrmvRule.blankToNull(input.crmv()),
        CrmvRule.normalizeUf(CrmvRule.blankToNull(input.ufCrmv())));
    userDataProvider.saveUser(user);

    String email = userDataProvider.findEmailByUserId(user.getId()).orElse(null);
    return ReadUserOutput.from(user, email);
  }
}
