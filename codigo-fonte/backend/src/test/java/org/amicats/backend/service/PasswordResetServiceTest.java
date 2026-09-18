package org.amicats.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.Optional;
import org.amicats.backend.domain.entity.User;
import org.amicats.backend.domain.entity.UserAuth;
import org.amicats.backend.domain.enums.AccessType;
import org.amicats.backend.repository.user.UserAuthRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.MailSendException;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class PasswordResetServiceTest {

  @Mock private UserAuthRepository userAuthRepository;
  @Mock private PasswordEncoder passwordEncoder;
  @Mock private TemporaryPasswordGenerator temporaryPasswordGenerator;
  @Mock private MailService mailService;
  @Mock private TemporaryPasswordEmailTemplate emailTemplate;

  @InjectMocks private PasswordResetService passwordResetService;

  private UserAuth authFor(User user) {
    return new UserAuth(user, "marina.alves@amicats.org.br", "old-hash");
  }

  private User activeUser() {
    return new User("Marina Alves", null, null, AccessType.Administrator, null, null, null);
  }

  @Test
  void doesNothingWhenTheEmailIsNotRegistered() {
    when(userAuthRepository.findByEmail("unknown@amicats.org.br")).thenReturn(Optional.empty());

    passwordResetService.forgotPassword("unknown@amicats.org.br");

    verifyNoInteractions(mailService, temporaryPasswordGenerator, passwordEncoder);
    verify(userAuthRepository, never()).save(any());
  }

  @Test
  void doesNothingWhenTheUserIsInactive() {
    User user = activeUser();
    user.deactive();
    UserAuth auth = authFor(user);
    when(userAuthRepository.findByEmail("marina.alves@amicats.org.br"))
        .thenReturn(Optional.of(auth));

    passwordResetService.forgotPassword("marina.alves@amicats.org.br");

    verifyNoInteractions(mailService, temporaryPasswordGenerator, passwordEncoder);
    verify(userAuthRepository, never()).save(any());
  }

  @Test
  void doesNothingWhenAResetWasAlreadyRequestedWithinTheCooldown() {
    UserAuth auth = authFor(activeUser());
    auth.setPasswordResetLastRequestedAt(LocalDateTime.now().minusMinutes(2));
    when(userAuthRepository.findByEmail("marina.alves@amicats.org.br"))
        .thenReturn(Optional.of(auth));

    passwordResetService.forgotPassword("marina.alves@amicats.org.br");

    verifyNoInteractions(mailService, temporaryPasswordGenerator, passwordEncoder);
    verify(userAuthRepository, never()).save(any());
  }

  @Test
  void allowsANewRequestOnceTheCooldownHasElapsed() throws Exception {
    UserAuth auth = authFor(activeUser());
    auth.setPasswordResetLastRequestedAt(LocalDateTime.now().minusMinutes(6));
    when(userAuthRepository.findByEmail("marina.alves@amicats.org.br"))
        .thenReturn(Optional.of(auth));
    when(temporaryPasswordGenerator.generate()).thenReturn("Temp0rary!Pw");
    when(passwordEncoder.encode("Temp0rary!Pw")).thenReturn("new-hash");
    when(emailTemplate.subject()).thenReturn("Sua senha de acesso ao Amicats");

    passwordResetService.forgotPassword("marina.alves@amicats.org.br");

    verify(mailService, times(1))
        .sendTemporaryPasswordEmail(eq("marina.alves@amicats.org.br"), anyString(), any(), any());
    assertThat(auth.getPasswordHash()).isEqualTo("new-hash");
  }

  @Test
  void sendsTheEmailBeforePersistingTheNewPasswordOnTheHappyPath() throws Exception {
    UserAuth auth = authFor(activeUser());
    when(userAuthRepository.findByEmail("marina.alves@amicats.org.br"))
        .thenReturn(Optional.of(auth));
    when(temporaryPasswordGenerator.generate()).thenReturn("Temp0rary!Pw");
    when(passwordEncoder.encode("Temp0rary!Pw")).thenReturn("new-hash");
    when(emailTemplate.subject()).thenReturn("Sua senha de acesso ao Amicats");
    when(emailTemplate.htmlBody("Marina Alves", "Temp0rary!Pw")).thenReturn("<html/>");
    when(emailTemplate.plainTextBody("Marina Alves", "Temp0rary!Pw")).thenReturn("plain");

    passwordResetService.forgotPassword("MARINA.ALVES@amicats.org.br  ");

    verify(mailService)
        .sendTemporaryPasswordEmail(
            "marina.alves@amicats.org.br", "Sua senha de acesso ao Amicats", "<html/>", "plain");
    assertThat(auth.getPasswordHash()).isEqualTo("new-hash");
    assertThat(auth.isMustChangePassword()).isTrue();
    assertThat(auth.getPasswordResetLastRequestedAt()).isNotNull();
    verify(userAuthRepository).save(auth);
  }

  @Test
  void doesNotPersistAnythingWhenTheEmailFailsToSend() throws Exception {
    UserAuth auth = authFor(activeUser());
    when(userAuthRepository.findByEmail("marina.alves@amicats.org.br"))
        .thenReturn(Optional.of(auth));
    when(temporaryPasswordGenerator.generate()).thenReturn("Temp0rary!Pw");
    when(emailTemplate.subject()).thenReturn("Sua senha de acesso ao Amicats");
    doThrow(new MailSendException("smtp down"))
        .when(mailService)
        .sendTemporaryPasswordEmail(anyString(), anyString(), any(), any());

    passwordResetService.forgotPassword("marina.alves@amicats.org.br");

    assertThat(auth.getPasswordHash()).isEqualTo("old-hash");
    assertThat(auth.isMustChangePassword()).isFalse();
    assertThat(auth.getPasswordResetLastRequestedAt()).isNull();
    verify(userAuthRepository, never()).save(any());
  }
}
