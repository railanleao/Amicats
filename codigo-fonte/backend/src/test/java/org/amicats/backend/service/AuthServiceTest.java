package org.amicats.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.Optional;
import org.amicats.backend.domain.entity.User;
import org.amicats.backend.domain.entity.UserAuth;
import org.amicats.backend.domain.enums.AccessType;
import org.amicats.backend.domain.usecase.userauth.LoginRequest;
import org.amicats.backend.domain.usecase.userauth.LoginResponse;
import org.amicats.backend.exception.InvalidCredentialsException;
import org.amicats.backend.repository.user.UserAuthRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

  @Mock private UserAuthRepository userAuthRepository;
  @Mock private PasswordEncoder passwordEncoder;
  @Mock private JwtService jwtService;

  @InjectMocks private AuthService authService;

  @Test
  void returnsTermsAcceptedAndMustChangePasswordFromTheUserState() {
    User user =
        new User(
            "Marina Alves", null, null, AccessType.Administrator, null, null, LocalDateTime.now());
    UserAuth auth = new UserAuth(user, "marina.alves@amicats.org.br", "hash");
    auth.setMustChangePassword(true);

    when(userAuthRepository.findByEmail("marina.alves@amicats.org.br"))
        .thenReturn(Optional.of(auth));
    when(passwordEncoder.matches("senha-forte", "hash")).thenReturn(true);
    when(jwtService.generateJwtToken(user, auth)).thenReturn("token");

    LoginResponse response =
        authService.login(new LoginRequest("marina.alves@amicats.org.br", "senha-forte"));

    assertThat(response.termsAccepted()).isTrue();
    assertThat(response.mustChangePassword()).isTrue();
    assertThat(response.token()).isEqualTo("token");
  }

  @Test
  void rejectsWrongPassword() {
    User user = new User("Marina Alves", null, null, AccessType.Administrator, null, null, null);
    UserAuth auth = new UserAuth(user, "marina.alves@amicats.org.br", "hash");

    when(userAuthRepository.findByEmail("marina.alves@amicats.org.br"))
        .thenReturn(Optional.of(auth));
    when(passwordEncoder.matches("errada", "hash")).thenReturn(false);

    assertThatThrownBy(
            () -> authService.login(new LoginRequest("marina.alves@amicats.org.br", "errada")))
        .isInstanceOf(InvalidCredentialsException.class);
  }

  @Test
  void rejectsInactiveUser() {
    User user = new User("Marina Alves", null, null, AccessType.Administrator, null, null, null);
    user.deactivate();
    UserAuth auth = new UserAuth(user, "marina.alves@amicats.org.br", "hash");

    when(userAuthRepository.findByEmail("marina.alves@amicats.org.br"))
        .thenReturn(Optional.of(auth));

    assertThatThrownBy(
            () -> authService.login(new LoginRequest("marina.alves@amicats.org.br", "qualquer")))
        .isInstanceOf(InvalidCredentialsException.class);
  }

  @Test
  void rejectsUnknownEmail() {
    when(userAuthRepository.findByEmail("desconhecido@amicats.org.br"))
        .thenReturn(Optional.empty());

    assertThatThrownBy(
            () -> authService.login(new LoginRequest("desconhecido@amicats.org.br", "qualquer")))
        .isInstanceOf(ResponseStatusException.class);
  }

  @Test
  void registersLastLoginOnSuccessfulLogin() {
    User user = new User("Marina Alves", null, null, AccessType.Administrator, null, null, null);
    UserAuth auth = new UserAuth(user, "marina.alves@amicats.org.br", "hash");

    when(userAuthRepository.findByEmail("marina.alves@amicats.org.br"))
        .thenReturn(Optional.of(auth));
    when(passwordEncoder.matches("senha-forte", "hash")).thenReturn(true);
    when(jwtService.generateJwtToken(user, auth)).thenReturn("token");

    authService.login(new LoginRequest("marina.alves@amicats.org.br", "senha-forte"));

    assertThat(user.getLastLoginAt()).isNotNull();
  }
}
