package org.amicats.backend.domain.usecase.user.create;

import lombok.Builder;
import org.amicats.backend.domain.entity.User;
import org.amicats.backend.domain.entity.UserAuth;
import org.amicats.backend.domain.interfaces.dataprovider.user.UserDataProvider;
import org.amicats.backend.domain.usecase.user.read.ReadUserOutput;
import org.amicats.backend.exception.EmailAlreadyRegisteredException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

@Builder
public class CreateUserUseCase {

  private UserDataProvider userDataProvider;
  private PasswordEncoder passwordEncoder;

  @Transactional
  public ReadUserOutput execute(CreateUserInput input) {
    if (userDataProvider.existsByEmail(input.email())) {
      throw new EmailAlreadyRegisteredException(input.email());
    }

    User user =
        new User(
            input.fullName(),
            input.phoneNumber(),
            input.imageUrl(),
            input.accessType(),
            input.crmv(),
            input.ufCrmv(),
            null);
    userDataProvider.saveUser(user);

    UserAuth auth = new UserAuth(user, input.email(), passwordEncoder.encode(input.password()));
    auth.setMustChangePassword(true);
    userDataProvider.saveUserAuth(auth);

    return ReadUserOutput.from(user, input.email());
  }
}
