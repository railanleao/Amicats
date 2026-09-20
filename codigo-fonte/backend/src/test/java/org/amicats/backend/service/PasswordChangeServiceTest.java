package org.amicats.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.util.Optional;
import org.amicats.backend.domain.entity.User;
import org.amicats.backend.domain.entity.UserAuth;
import org.amicats.backend.domain.enums.AccessType;
import org.amicats.backend.domain.usecase.userauth.ChangePasswordRequest;
import org.amicats.backend.domain.usecase.userauth.LoginResponse;
import org.amicats.backend.exception.InvalidPasswordChangeException;
import org.amicats.backend.repository.user.UserAuthRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class PasswordChangeServiceTest {

  @Mock private UserAuthRepository userAuthRepository;
  @Mock private PasswordEncoder passwordEncoder;
  @Mock private JwtService jwtService;

  @InjectMocks private PasswordChangeService passwordChangeService;

  private UserAuth authWith(String passwordHash) {
    User user = new User("Marina Alves", null, null, AccessType.Administrator, null, null, null);
    return new UserAuth(user, "marina.alves@amicats.org.br", passwordHash);
  }

  @Test
  void changesThePasswordAndClearsTheMustChangeFlagOnSuccess() {
    UserAuth auth = authWith("old-hash");
    auth.setMustChangePassword(true);
    ChangePasswordRequest request =
        new ChangePasswordRequest("current", "new-strong-pw", "new-strong-pw");

    when(userAuthRepository.findByUser_Id(1)).thenReturn(Optional.of(auth));
    when(passwordEncoder.matches("current", "old-hash")).thenReturn(true);
    when(passwordEncoder.encode("new-strong-pw")).thenReturn("new-hash");
    when(jwtService.generateJwtToken(any(User.class), any(UserAuth.class))).thenReturn("new-token");

    LoginResponse response = passwordChangeService.changePassword(1, request);

    assertThat(auth.getPasswordHash()).isEqualTo("new-hash");
    assertThat(auth.isMustChangePassword()).isFalse();
    assertThat(response.token()).isEqualTo("new-token");
    assertThat(response.mustChangePassword()).isFalse();
  }

  @Test
  void rejectsWhenCurrentPasswordDoesNotMatch() {
    UserAuth auth = authWith("old-hash");
    when(userAuthRepository.findByUser_Id(1)).thenReturn(Optional.of(auth));
    when(passwordEncoder.matches("wrong", "old-hash")).thenReturn(false);

    ChangePasswordRequest request =
        new ChangePasswordRequest("wrong", "new-strong-pw", "new-strong-pw");

    assertThatThrownBy(() -> passwordChangeService.changePassword(1, request))
        .isInstanceOf(InvalidPasswordChangeException.class)
        .hasMessageContaining("incorreta");
    assertThat(auth.getPasswordHash()).isEqualTo("old-hash");
  }

  @Test
  void rejectsWhenConfirmationDoesNotMatchTheNewPassword() {
    UserAuth auth = authWith("old-hash");
    when(userAuthRepository.findByUser_Id(1)).thenReturn(Optional.of(auth));
    when(passwordEncoder.matches("current", "old-hash")).thenReturn(true);

    ChangePasswordRequest request =
        new ChangePasswordRequest("current", "new-strong-pw", "different");

    assertThatThrownBy(() -> passwordChangeService.changePassword(1, request))
        .isInstanceOf(InvalidPasswordChangeException.class)
        .hasMessageContaining("confirmação");
  }

  @Test
  void rejectsWhenNewPasswordIsSameAsCurrent() {
    UserAuth auth = authWith("old-hash");
    when(userAuthRepository.findByUser_Id(1)).thenReturn(Optional.of(auth));
    when(passwordEncoder.matches("same-pw", "old-hash")).thenReturn(true);

    ChangePasswordRequest request = new ChangePasswordRequest("same-pw", "same-pw", "same-pw");

    assertThatThrownBy(() -> passwordChangeService.changePassword(1, request))
        .isInstanceOf(InvalidPasswordChangeException.class)
        .hasMessageContaining("diferente");
  }

  @Test
  void rejectsWhenUserAuthIsNotFound() {
    when(userAuthRepository.findByUser_Id(99)).thenReturn(Optional.empty());
    ChangePasswordRequest request = new ChangePasswordRequest("a", "bbbbbbbb", "bbbbbbbb");

    assertThatThrownBy(() -> passwordChangeService.changePassword(99, request))
        .isInstanceOf(InvalidPasswordChangeException.class);
  }
}
