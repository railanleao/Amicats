package org.amicats.backend.domain.usecase.user.create;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.amicats.backend.domain.entity.User;
import org.amicats.backend.domain.entity.UserAuth;
import org.amicats.backend.domain.enums.AccessType;
import org.amicats.backend.domain.interfaces.dataprovider.user.UserDataProvider;
import org.amicats.backend.exception.EmailAlreadyRegisteredException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class CreateUserUseCaseTest {

  @Mock private UserDataProvider userDataProvider;
  @Mock private PasswordEncoder passwordEncoder;

  private CreateUserUseCase useCase;

  @BeforeEach
  void setUp() {
    useCase =
        CreateUserUseCase.builder()
            .userDataProvider(userDataProvider)
            .passwordEncoder(passwordEncoder)
            .build();
  }

  private static CreateUserInput input(String email, AccessType type, String crmv, String uf) {
    return new CreateUserInput("Rafael Nogueira", email, null, type, crmv, uf);
  }

  @Test
  void createsAnActiveUserThatStillHasToCompleteTheFirstAccess() {
    when(userDataProvider.existsByEmail("rafael@amicats.org.br")).thenReturn(false);
    when(passwordEncoder.encode(anyString())).thenReturn("hashed");

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
  }

  @Test
  void storesALongRandomPasswordThatIsDifferentForEachUser() {
    when(userDataProvider.existsByEmail(anyString())).thenReturn(false);
    when(passwordEncoder.encode(anyString())).thenReturn("hashed");

    useCase.execute(input("a@amicats.org.br", AccessType.Viewer, null, null));
    useCase.execute(input("b@amicats.org.br", AccessType.Viewer, null, null));

    ArgumentCaptor<String> raw = ArgumentCaptor.forClass(String.class);
    verify(passwordEncoder, times(2)).encode(raw.capture());
    assertThat(raw.getAllValues().get(0)).hasSizeGreaterThanOrEqualTo(32);
    assertThat(raw.getAllValues().get(0)).isNotEqualTo(raw.getAllValues().get(1));
  }

  @Test
  void normalizesTheCrmvStateToUpperCase() {
    when(userDataProvider.existsByEmail(anyString())).thenReturn(false);
    when(passwordEncoder.encode(anyString())).thenReturn("hashed");

    useCase.execute(input("vet@amicats.org.br", AccessType.Veterinarian, "12345", "ms"));

    ArgumentCaptor<User> user = ArgumentCaptor.forClass(User.class);
    verify(userDataProvider).saveUser(user.capture());
    assertThat(user.getValue().getUfCrmv()).isEqualTo("MS");
  }

  @Test
  void rejectsAnEmailThatIsAlreadyRegistered() {
    when(userDataProvider.existsByEmail("rafael@amicats.org.br")).thenReturn(true);

    assertThatThrownBy(
            () -> useCase.execute(input("rafael@amicats.org.br", AccessType.Viewer, null, null)))
        .isInstanceOf(EmailAlreadyRegisteredException.class);

    verify(userDataProvider, never()).saveUser(any());
    verify(userDataProvider, never()).saveUserAuth(any());
  }
}
