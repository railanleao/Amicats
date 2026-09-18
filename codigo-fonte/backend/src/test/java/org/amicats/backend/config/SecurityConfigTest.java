package org.amicats.backend.config;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;

class SecurityConfigTest {

  private final SecurityConfig securityConfig = new SecurityConfig();

  @Test
  void grantsOnboardingPendingWhenTermsAreNotAccepted() {
    List<String> authorities =
        authorityNamesFor(
            Map.of("role", "Administrator", "termsAccepted", false, "mustChangePassword", false));

    assertThat(authorities).contains("ROLE_Administrator", "ONBOARDING_PENDING");
  }

  @Test
  void grantsOnboardingPendingWhenAPasswordChangeIsStillPending() {
    List<String> authorities =
        authorityNamesFor(
            Map.of("role", "Administrator", "termsAccepted", true, "mustChangePassword", true));

    assertThat(authorities).contains("ROLE_Administrator", "ONBOARDING_PENDING");
  }

  @Test
  void doesNotGrantOnboardingPendingWhenOnboardingIsComplete() {
    List<String> authorities =
        authorityNamesFor(
            Map.of("role", "Administrator", "termsAccepted", true, "mustChangePassword", false));

    assertThat(authorities).contains("ROLE_Administrator").doesNotContain("ONBOARDING_PENDING");
  }

  @Test
  void treatsAbsentClaimsAsPendingByDefault() {
    List<String> authorities = authorityNamesFor(Map.of("role", "Veterinarian"));

    assertThat(authorities).contains("ROLE_Veterinarian", "ONBOARDING_PENDING");
  }

  private List<String> authorityNamesFor(Map<String, Object> extraClaims) {
    JwtAuthenticationConverter converter = securityConfig.jwtAuthenticationConverter();

    Jwt.Builder builder =
        Jwt.withTokenValue("token")
            .header("alg", "HS256")
            .subject("1")
            .issuedAt(Instant.now())
            .expiresAt(Instant.now().plusSeconds(3600));
    extraClaims.forEach(builder::claim);

    AbstractAuthenticationToken token = converter.convert(builder.build());

    return token.getAuthorities().stream().map(GrantedAuthority::getAuthority).toList();
  }
}
