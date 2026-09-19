package org.amicats.backend.domain.usecase.user.create;

import java.util.Locale;
import lombok.Builder;
import org.amicats.backend.domain.entity.User;
import org.amicats.backend.domain.entity.UserAuth;
import org.amicats.backend.domain.interfaces.dataprovider.user.UserDataProvider;
import org.amicats.backend.domain.usecase.user.common.CrmvRule;
import org.amicats.backend.domain.usecase.user.read.ReadUserOutput;
import org.amicats.backend.exception.AccessEmailNotSentException;
import org.amicats.backend.exception.EmailAlreadyRegisteredException;
import org.amicats.backend.service.MailService;
import org.amicats.backend.service.TemporaryPasswordEmailTemplate;
import org.amicats.backend.service.TemporaryPasswordGenerator;
import org.springframework.mail.MailException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

@Builder
public class CreateUserUseCase {

  private UserDataProvider userDataProvider;
  private PasswordEncoder passwordEncoder;
  private TemporaryPasswordGenerator temporaryPasswordGenerator;
  private MailService mailService;
  private TemporaryPasswordEmailTemplate emailTemplate;

  @Transactional
  public ReadUserOutput execute(CreateUserInput input) {
    String email = input.email().trim().toLowerCase(Locale.ROOT);

    if (userDataProvider.existsByEmail(email)) {
      throw new EmailAlreadyRegisteredException(email);
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

    String temporaryPassword = temporaryPasswordGenerator.generate();
    UserAuth auth = new UserAuth(user, email, passwordEncoder.encode(temporaryPassword));
    auth.setMustChangePassword(true);
    userDataProvider.saveUserAuth(auth);

    sendWelcomeEmail(user, email, temporaryPassword);

    return ReadUserOutput.from(user, email);
  }

  private void sendWelcomeEmail(User user, String email, String temporaryPassword) {
    try {
      mailService.sendTemporaryPasswordEmail(
          email,
          emailTemplate.welcomeSubject(),
          emailTemplate.welcomeHtmlBody(user.getFullName(), temporaryPassword),
          emailTemplate.welcomePlainTextBody(user.getFullName(), temporaryPassword));
    } catch (MailException e) {
      throw new AccessEmailNotSentException(email, e);
    }
  }
}
