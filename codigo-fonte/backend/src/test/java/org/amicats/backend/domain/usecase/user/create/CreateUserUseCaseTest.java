package org.amicats.backend.domain.usecase.user.create;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.amicats.backend.domain.entity.UserAuth;
import org.amicats.backend.domain.enums.AccessType;
import org.amicats.backend.domain.interfaces.dataprovider.user.UserDataProvider;
import org.amicats.backend.exception.EmailAlreadyRegisteredException;
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

  private CreateUserInput input() {
    return new CreateUserInput(
        "Rafael Nogueira",
        "rafael@amicats.org.br",
        "senha-temporaria",
        null,
        null,
        AccessType.Veterinarian,
        "12345",
        "MG");
  }

  @Test
  void newUsersStartWithMustChangePasswordTrue() {
    CreateUserUseCase useCase =
        CreateUserUseCase.builder()
            .userDataProvider(userDataProvider)
            .passwordEncoder(passwordEncoder)
            .build();
    CreateUserInput input = input();

    when(userDataProvider.existsByEmail(input.email())).thenReturn(false);
    when(passwordEncoder.encode(input.password())).thenReturn("hash");

    useCase.execute(input);

    ArgumentCaptor<UserAuth> authCaptor = ArgumentCaptor.forClass(UserAuth.class);
    verify(userDataProvider).saveUserAuth(authCaptor.capture());
    assertThat(authCaptor.getValue().isMustChangePassword()).isTrue();
  }

  @Test
  void rejectsWhenEmailIsAlreadyRegistered() {
    CreateUserUseCase useCase =
        CreateUserUseCase.builder()
            .userDataProvider(userDataProvider)
            .passwordEncoder(passwordEncoder)
            .build();
    CreateUserInput input = input();

    when(userDataProvider.existsByEmail(input.email())).thenReturn(true);

    assertThatThrownBy(() -> useCase.execute(input))
        .isInstanceOf(EmailAlreadyRegisteredException.class);
  }
}
