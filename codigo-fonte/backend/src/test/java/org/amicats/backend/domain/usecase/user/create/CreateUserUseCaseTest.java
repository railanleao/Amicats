package org.amicats.backend.domain.usecase.user.create;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import org.amicats.backend.domain.entity.User;
import org.amicats.backend.domain.entity.UserAuth;
import org.amicats.backend.domain.enums.AccessType;
import org.amicats.backend.domain.interfaces.dataprovider.user.UserDataProvider;
import org.amicats.backend.exception.AccessEmailNotSentException;
import org.amicats.backend.exception.EmailAlreadyRegisteredException;
import org.amicats.backend.service.MailService;
import org.amicats.backend.service.TemporaryPasswordEmailTemplate;
import org.amicats.backend.service.TemporaryPasswordGenerator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.MailSendException;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class CreateUserUseCaseTest {

  private static final String TEMP_PASSWORD = "Temp0rary!Pw";

  @Mock private UserDataProvider userDataProvider;
  @Mock private PasswordEncoder passwordEncoder;
  @Mock private TemporaryPasswordGenerator temporaryPasswordGenerator;
  @Mock private MailService mailService;
  @Mock private TemporaryPasswordEmailTemplate emailTemplate;

  private CreateUserUseCase useCase;

  @BeforeEach
  void setUp() {
    useCase =
        CreateUserUseCase.builder()
            .userDataProvider(userDataProvider)
            .passwordEncoder(passwordEncoder)
            .temporaryPasswordGenerator(temporaryPasswordGenerator)
            .mailService(mailService)
            .emailTemplate(emailTemplate)
            .build();
  }

  private static CreateUserInput input(String email, AccessType type, String crmv, String uf) {
    return new CreateUserInput("Rafael Nogueira", email, null, type, crmv, uf);
  }

  private void stubPasswordAndTemplate() {
    when(temporaryPasswordGenerator.generate()).thenReturn(TEMP_PASSWORD);
    when(passwordEncoder.encode(TEMP_PASSWORD)).thenReturn("hashed");
    when(emailTemplate.welcomeSubject()).thenReturn("Assunto");
    when(emailTemplate.welcomeHtmlBody("Rafael Nogueira", TEMP_PASSWORD)).thenReturn("<html/>");
    when(emailTemplate.welcomePlainTextBody("Rafael Nogueira", TEMP_PASSWORD)).thenReturn("plain");
  }

  @Test
  void createsAnActiveUserAndEmailsTheTemporaryPassword() {
    when(userDataProvider.existsByEmail("rafael@amicats.org.br")).thenReturn(false);
    stubPasswordAndTemplate();

    useCase.execute(input("rafael@amicats.org.br", AccessType.Assistant, null, null));

    ArgumentCaptor<User> user = ArgumentCaptor.forClass(User.class);
    verify(userDataProvider).saveUser(user.capture());
    assertThat(user.getValue().getFullName()).isEqualTo("Rafael Nogueira");
    assertThat(user.getValue().isActive()).isTrue();
    assertThat(user.getValue().hasAcceptedTerms()).isFalse();
    assertThat(user.getValue().getImageUrl()).isNull();

    ArgumentCaptor<UserAuth> auth = ArgumentCaptor.forClass(UserAuth.class);
    verify(userDataProvider).saveUserAuth(auth.capture());
    assertThat(auth.getValue().getEmail()).isEqualTo("rafael@amicats.org.br");
    assertThat(auth.getValue().getPasswordHash()).isEqualTo("hashed");
    assertThat(auth.getValue().isMustChangePassword()).isTrue();

    verify(mailService)
        .sendTemporaryPasswordEmail("rafael@amicats.org.br", "Assunto", "<html/>", "plain");
  }

  @Test
  void storesTheEmailTrimmedAndInLowerCase() {
    when(userDataProvider.existsByEmail("rafael@amicats.org.br")).thenReturn(false);
    stubPasswordAndTemplate();

    var output = useCase.execute(input("  Rafael@Amicats.ORG.br ", AccessType.Viewer, null, null));

    assertThat(output.email()).isEqualTo("rafael@amicats.org.br");
    verify(mailService)
        .sendTemporaryPasswordEmail(
            eq("rafael@amicats.org.br"), anyString(), anyString(), anyString());
  }

  @Test
  void normalizesTheCrmvStateToUpperCase() {
    when(userDataProvider.existsByEmail(anyString())).thenReturn(false);
    stubPasswordAndTemplate();

    useCase.execute(input("vet@amicats.org.br", AccessType.Veterinarian, "12345", "ms"));

    ArgumentCaptor<User> user = ArgumentCaptor.forClass(User.class);
    verify(userDataProvider).saveUser(user.capture());
    assertThat(user.getValue().getUfCrmv()).isEqualTo("MS");
  }

  @Test
  void rejectsAnEmailThatIsAlreadyRegisteredWithoutSendingAnything() {
    when(userDataProvider.existsByEmail("rafael@amicats.org.br")).thenReturn(true);

    assertThatThrownBy(
            () -> useCase.execute(input("rafael@amicats.org.br", AccessType.Viewer, null, null)))
        .isInstanceOf(EmailAlreadyRegisteredException.class);

    verify(userDataProvider, never()).saveUser(any());
    verify(userDataProvider, never()).saveUserAuth(any());
    verifyNoInteractions(mailService, temporaryPasswordGenerator);
  }

  @Test
  void failsWhenTheAccessEmailCannotBeSent() {
    when(userDataProvider.existsByEmail(anyString())).thenReturn(false);
    when(temporaryPasswordGenerator.generate()).thenReturn(TEMP_PASSWORD);
    when(passwordEncoder.encode(TEMP_PASSWORD)).thenReturn("hashed");
    when(emailTemplate.welcomeSubject()).thenReturn("Assunto");
    doThrow(new MailSendException("smtp down"))
        .when(mailService)
        .sendTemporaryPasswordEmail(anyString(), anyString(), any(), any());

    assertThatThrownBy(
            () -> useCase.execute(input("rafael@amicats.org.br", AccessType.Viewer, null, null)))
        .isInstanceOf(AccessEmailNotSentException.class);
  }

  @Test
  void storesBlankOptionalFieldsAsNull() {
    when(userDataProvider.existsByEmail(anyString())).thenReturn(false);
    stubPasswordAndTemplate();

    useCase.execute(
        new CreateUserInput(
            "Rafael Nogueira", "rafael@amicats.org.br", "  ", AccessType.Assistant, "", ""));

    ArgumentCaptor<User> user = ArgumentCaptor.forClass(User.class);
    verify(userDataProvider).saveUser(user.capture());
    assertThat(user.getValue().getPhoneNumber()).isNull();
    assertThat(user.getValue().getCrmv()).isNull();
    assertThat(user.getValue().getUfCrmv()).isNull();
  }
}
