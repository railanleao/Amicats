package org.amicats.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.util.Optional;
import org.amicats.backend.domain.entity.User;
import org.amicats.backend.domain.entity.UserAuth;
import org.amicats.backend.domain.enums.AccessType;
import org.amicats.backend.domain.usecase.userauth.LoginResponse;
import org.amicats.backend.exception.ResourceNotFoundException;
import org.amicats.backend.repository.user.UserAuthRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class TermsAcceptanceServiceTest {

  @Mock private UserAuthRepository userAuthRepository;
  @Mock private JwtService jwtService;

  @InjectMocks private TermsAcceptanceService termsAcceptanceService;

  @Test
  void marksTermsAsAcceptedAndReturnsANewToken() {
    User user = new User("Marina Alves", null, null, AccessType.Administrator, null, null, null);
    UserAuth auth = new UserAuth(user, "marina.alves@amicats.org.br", "hash");

    when(userAuthRepository.findByUser_Id(1)).thenReturn(Optional.of(auth));
    when(jwtService.generateJwtToken(any(User.class), any(UserAuth.class))).thenReturn("new-token");

    LoginResponse response = termsAcceptanceService.acceptTerms(1);

    assertThat(user.hasAcceptedTerms()).isTrue();
    assertThat(response.token()).isEqualTo("new-token");
    assertThat(response.termsAccepted()).isTrue();
    assertThat(response.mustChangePassword()).isFalse();
  }

  @Test
  void throwsWhenUserAuthIsNotFound() {
    when(userAuthRepository.findByUser_Id(99)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> termsAcceptanceService.acceptTerms(99))
        .isInstanceOf(ResourceNotFoundException.class);
  }
}
