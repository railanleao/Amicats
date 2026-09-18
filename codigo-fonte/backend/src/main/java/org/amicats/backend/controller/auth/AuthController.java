package org.amicats.backend.controller.auth;

import jakarta.validation.Valid;
import org.amicats.backend.domain.usecase.userauth.ChangePasswordRequest;
import org.amicats.backend.domain.usecase.userauth.LoginRequest;
import org.amicats.backend.domain.usecase.userauth.LoginResponse;
import org.amicats.backend.service.AuthService;
import org.amicats.backend.service.PasswordChangeService;
import org.amicats.backend.service.TermsAcceptanceService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {

  private final AuthService authService;
  private final TermsAcceptanceService termsAcceptanceService;
  private final PasswordChangeService passwordChangeService;

  public AuthController(
      AuthService authService,
      TermsAcceptanceService termsAcceptanceService,
      PasswordChangeService passwordChangeService) {

    this.authService = authService;
    this.termsAcceptanceService = termsAcceptanceService;
    this.passwordChangeService = passwordChangeService;
  }

  @PostMapping("/login")
  public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {

    LoginResponse response = authService.login(request);

    return ResponseEntity.ok(response);
  }

  @PostMapping("/accept-terms")
  public ResponseEntity<LoginResponse> acceptTerms(@AuthenticationPrincipal Jwt jwt) {

    Integer userId = Integer.valueOf(jwt.getSubject());
    LoginResponse response = termsAcceptanceService.acceptTerms(userId);

    return ResponseEntity.ok(response);
  }

  @PatchMapping("/change-password")
  public ResponseEntity<LoginResponse> changePassword(
      @AuthenticationPrincipal Jwt jwt, @Valid @RequestBody ChangePasswordRequest request) {

    Integer userId = Integer.valueOf(jwt.getSubject());
    LoginResponse response = passwordChangeService.changePassword(userId, request);

    return ResponseEntity.ok(response);
  }
}
