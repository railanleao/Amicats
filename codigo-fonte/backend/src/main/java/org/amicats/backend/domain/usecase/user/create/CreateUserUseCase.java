package org.amicats.backend.domain.usecase.user.create;

import java.security.SecureRandom;
import java.util.Base64;
import lombok.Builder;
import org.amicats.backend.domain.entity.User;
import org.amicats.backend.domain.entity.UserAuth;
import org.amicats.backend.domain.interfaces.dataprovider.user.UserDataProvider;
import org.amicats.backend.domain.usecase.user.common.CrmvRule;
import org.amicats.backend.domain.usecase.user.read.ReadUserOutput;
import org.amicats.backend.exception.EmailAlreadyRegisteredException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

@Builder
public class CreateUserUseCase {

  private static final SecureRandom SECURE_RANDOM = new SecureRandom();
  private static final int UNGUESSABLE_PASSWORD_BYTES = 32;

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
            null,
            input.accessType(),
            input.crmv(),
            CrmvRule.normalizeUf(input.ufCrmv()),
            null);
    userDataProvider.saveUser(user);

    UserAuth auth = new UserAuth(user, input.email(), passwordEncoder.encode(randomPassword()));
    auth.setMustChangePassword(true);
    userDataProvider.saveUserAuth(auth);

    return ReadUserOutput.from(user, input.email());
  }

  private static String randomPassword() {
    byte[] bytes = new byte[UNGUESSABLE_PASSWORD_BYTES];
    SECURE_RANDOM.nextBytes(bytes);
    return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
  }
}
