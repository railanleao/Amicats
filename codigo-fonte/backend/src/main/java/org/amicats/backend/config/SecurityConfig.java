package org.amicats.backend.config;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.security.authorization.AuthenticatedAuthorizationManager;
import org.springframework.security.authorization.AuthorityAuthorizationManager;
import org.springframework.security.authorization.AuthorizationManagers;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.oauth2.server.resource.web.authentication.BearerTokenAuthenticationFilter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

  private static final String ONBOARDING_PENDING_AUTHORITY = "ONBOARDING_PENDING";

  @Value("${app.cors.allowed-origins:http://localhost:4200}")
  private String allowedOrigins;

  @Bean
  SecurityFilterChain securityFilterChain(
      HttpSecurity http, Environment env, RateLimitFilter rateLimitFilter) throws Exception {

    // "/error" has to stay public: when an authenticated handler throws an exception (e.g. wrong
    // current password on /auth/change-password), the container forwards the response here via
    // response.sendError(...), and that forward goes through the security chain again. Without
    // this, the ONBOARDING_PENDING token (which can only reach /auth/accept-terms and
    // /auth/change-password) hits the anyRequest() rule and the client gets 403 instead of the
    // real business error.
    List<String> publicPaths =
        new ArrayList<>(List.of("/auth/login", "/auth/forgot-password", "/error"));

    boolean isProd = Arrays.asList(env.getActiveProfiles()).contains("prod");
    if (!isProd) {
      publicPaths.addAll(List.of("/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs/**"));
    }

    return http.csrf(csrf -> csrf.disable())
        .cors(cors -> cors.configurationSource(corsConfigurationSource()))
        .addFilterBefore(rateLimitFilter, BearerTokenAuthenticationFilter.class)
        .authorizeHttpRequests(
            auth ->
                auth.requestMatchers(publicPaths.toArray(new String[0]))
                    .permitAll()
                    .requestMatchers("/auth/accept-terms", "/auth/change-password")
                    .access(AuthenticatedAuthorizationManager.authenticated())
                    .anyRequest()
                    .access(
                        AuthorizationManagers.allOf(
                            AuthenticatedAuthorizationManager.authenticated(),
                            AuthorizationManagers.not(
                                AuthorityAuthorizationManager.hasAuthority(
                                    ONBOARDING_PENDING_AUTHORITY)))))
        .oauth2ResourceServer(
            oauth2 ->
                oauth2.jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter())))
        .build();
  }

  @Bean
  CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(List.of(allowedOrigins.split(",")));
    configuration.setAllowedMethods(
        Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
    configuration.setAllowedHeaders(List.of("Authorization", "Content-Type"));

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
  }

  /**
   * On top of the normal role authority (ROLE_...), grants the technical ONBOARDING_PENDING
   * authority when the token doesn't have the terms accepted yet or still has a temporary password
   * pending change — this is what blocks access to any route other than /auth/accept-terms or
   * /auth/change-password until onboarding is complete.
   */
  @Bean
  JwtAuthenticationConverter jwtAuthenticationConverter() {

    JwtGrantedAuthoritiesConverter authoritiesConverter = new JwtGrantedAuthoritiesConverter();

    authoritiesConverter.setAuthoritiesClaimName("role");
    authoritiesConverter.setAuthorityPrefix("ROLE_");

    JwtAuthenticationConverter converter = new JwtAuthenticationConverter();

    converter.setJwtGrantedAuthoritiesConverter(
        jwt -> {
          Collection<GrantedAuthority> authorities =
              new ArrayList<>(authoritiesConverter.convert(jwt));

          boolean termsAccepted = Boolean.TRUE.equals(jwt.getClaimAsBoolean("termsAccepted"));
          boolean mustChangePassword =
              Boolean.TRUE.equals(jwt.getClaimAsBoolean("mustChangePassword"));

          if (!termsAccepted || mustChangePassword) {
            authorities.add(new SimpleGrantedAuthority(ONBOARDING_PENDING_AUTHORITY));
          }

          return authorities;
        });

    return converter;
  }

  @Bean
  public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }
}
