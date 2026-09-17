package org.amicats.backend.domain.usecase.user.read;

import java.util.List;
import lombok.Builder;
import org.amicats.backend.domain.entity.User;
import org.amicats.backend.domain.interfaces.dataprovider.user.UserDataProvider;
import org.amicats.backend.exception.ResourceNotFoundException;
import org.springframework.transaction.annotation.Transactional;

@Builder
public class ReadUserUseCase {

  private UserDataProvider userDataProvider;

  @Transactional(readOnly = true)
  public ReadUserOutput findById(Integer id) {
    User user =
        userDataProvider
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado: " + id));
    String email = userDataProvider.findEmailByUserId(user.getId()).orElse(null);
    return ReadUserOutput.from(user, email);
  }

  @Transactional(readOnly = true)
  public List<ReadUserOutput> findAll() {
    return userDataProvider.findAll().stream()
        .map(
            user ->
                ReadUserOutput.from(
                    user, userDataProvider.findEmailByUserId(user.getId()).orElse(null)))
        .toList();
  }
}
