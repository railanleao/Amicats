package org.amicats.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.amicats.backend.domain.entity.User;
import org.amicats.backend.domain.entity.UserAuth;
import org.amicats.backend.domain.enums.AccessType;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("deprecation")
class JwtServiceTest {

  @Mock private JwtEncoder jwtEncoder;

  @InjectMocks private JwtService jwtService;

  private User userWithId() {
    User user = new User("Marina Alves", null, null, AccessType.Administrator, null, null, null);
    user.setId(1);
    return user;
  }

  @Test
  void includesTermsAcceptedAndMustChangePasswordClaims() {
    User user = userWithId();
    UserAuth auth = new UserAuth(user, "marina.alves@amicats.org.br", "hash");
    auth.setMustChangePassword(true);

    Jwt fakeJwt = Jwt.withTokenValue("fake-token").header("alg", "HS256").claim("sub", "1").build();
    when(jwtEncoder.encode(any(JwtEncoderParameters.class))).thenReturn(fakeJwt);

    ArgumentCaptor<JwtEncoderParameters> captor =
        ArgumentCaptor.forClass(JwtEncoderParameters.class);

    String token = jwtService.generateJwtToken(user, auth);

    verify(jwtEncoder).encode(captor.capture());
    JwtClaimsSet claims = captor.getValue().getClaims();

    assertThat(token).isEqualTo("fake-token");
    assertThat(claims.getClaims().get("termsAccepted")).isEqualTo(false);
    assertThat(claims.getClaims().get("mustChangePassword")).isEqualTo(true);
    assertThat(claims.getClaims().get("role")).isEqualTo("Administrator");
    assertThat(claims.getClaims().get("email")).isEqualTo("marina.alves@amicats.org.br");
  }

  @Test
  void reportsTermsAcceptedTrueWhenTheUserHasAlreadyAccepted() {
    User user = userWithId();
    user.acceptTerms();
    UserAuth auth = new UserAuth(user, "marina.alves@amicats.org.br", "hash");

    Jwt fakeJwt = Jwt.withTokenValue("fake-token").header("alg", "HS256").claim("sub", "1").build();
    when(jwtEncoder.encode(any(JwtEncoderParameters.class))).thenReturn(fakeJwt);

    ArgumentCaptor<JwtEncoderParameters> captor =
        ArgumentCaptor.forClass(JwtEncoderParameters.class);

    jwtService.generateJwtToken(user, auth);

    verify(jwtEncoder).encode(captor.capture());
    assertThat(captor.getValue().getClaims().getClaims().get("termsAccepted")).isEqualTo(true);
    assertThat(captor.getValue().getClaims().getClaims().get("mustChangePassword"))
        .isEqualTo(false);
  }
}
