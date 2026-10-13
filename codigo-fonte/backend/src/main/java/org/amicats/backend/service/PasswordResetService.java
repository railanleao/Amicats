package org.amicats.backend.service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Optional;
import org.amicats.backend.domain.entity.User;
import org.amicats.backend.domain.entity.UserAuth;
import org.amicats.backend.repository.user.UserAuthRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.MailException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * This service never throws to the caller — the controller always responds 204 regardless of what
 * happens here (email not found, inactive user, cooldown, or a genuinely eligible request), so this
 * endpoint never reveals whether an account exists.
 */
@Service
public class PasswordResetService {

  private static final Logger log = LoggerFactory.getLogger(PasswordResetService.class);
  private static final Duration COOLDOWN = Duration.ofMinutes(5);

  private final UserAuthRepository userAuthRepository;
  private final PasswordEncoder passwordEncoder;
  private final TemporaryPasswordGenerator temporaryPasswordGenerator;
  private final MailService mailService;
  private final TemporaryPasswordEmailTemplate emailTemplate;

  public PasswordResetService(
      UserAuthRepository userAuthRepository,
      PasswordEncoder passwordEncoder,
      TemporaryPasswordGenerator temporaryPasswordGenerator,
      MailService mailService,
      TemporaryPasswordEmailTemplate emailTemplate) {
    this.userAuthRepository = userAuthRepository;
    this.passwordEncoder = passwordEncoder;
    this.temporaryPasswordGenerator = temporaryPasswordGenerator;
    this.mailService = mailService;
    this.emailTemplate = emailTemplate;
  }

  /**
   * @Transactional keeps the Hibernate session open for the whole method — needed because
   * UserAuth.user is a lazy association, and auth.getUser() below would otherwise fail with
   * LazyInitializationException once the short-lived session from findByEmail() closes.
   */
  @Transactional
  public void forgotPassword(String rawEmail) {

    String email = normalize(rawEmail);

    Optional<UserAuth> maybeAuth = userAuthRepository.findByEmail(email);

    if (maybeAuth.isEmpty()) {
      return;
    }

    UserAuth auth = maybeAuth.get();
    User user = auth.getUser();

    if (!user.isActive()) {
      return;
    }

    if (isWithinCooldown(auth)) {
      return;
    }

    String temporaryPassword = temporaryPasswordGenerator.generate();

    try {
      mailService.sendTemporaryPasswordEmail(
          auth.getEmail(),
          emailTemplate.subject(),
          emailTemplate.htmlBody(user.getFullName(), temporaryPassword),
          emailTemplate.plainTextBody(user.getFullName(), temporaryPassword));
    } catch (MailException e) {
      log.error(
          "Falha ao enviar e-mail de senha temporária para o id_user_auth={}", auth.getId(), e);
      return;
    }

    // Only persists the new password after the email has been sent successfully — this is what
    // guarantees the user is never locked out by an SMTP failure.
    auth.changePasswordHash(passwordEncoder.encode(temporaryPassword));
    auth.setMustChangePassword(true);
    auth.setPasswordResetLastRequestedAt(LocalDateTime.now(ZoneOffset.UTC));
    userAuthRepository.save(auth);
  }

  private boolean isWithinCooldown(UserAuth auth) {
    LocalDateTime lastRequestedAt = auth.getPasswordResetLastRequestedAt();
    return lastRequestedAt != null
        && Duration.between(lastRequestedAt, LocalDateTime.now(ZoneOffset.UTC)).compareTo(COOLDOWN)
            < 0;
  }

  private String normalize(String email) {
    return email.trim().toLowerCase();
  }
}
