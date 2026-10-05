package org.amicats.backend.service;

import org.amicats.backend.domain.entity.User;
import org.amicats.backend.domain.entity.UserAuth;
import org.amicats.backend.domain.usecase.userauth.ChangePasswordRequest;
import org.amicats.backend.domain.usecase.userauth.LoginResponse;
import org.amicats.backend.exception.InvalidPasswordChangeException;
import org.amicats.backend.repository.user.UserAuthRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PasswordChangeService {

  private final UserAuthRepository userAuthRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;

  public PasswordChangeService(
      UserAuthRepository userAuthRepository,
      PasswordEncoder passwordEncoder,
      JwtService jwtService) {

    this.userAuthRepository = userAuthRepository;
    this.passwordEncoder = passwordEncoder;
    this.jwtService = jwtService;
  }

  @Transactional
  public LoginResponse changePassword(Integer userId, ChangePasswordRequest request) {

    UserAuth auth =
        userAuthRepository
            .findByUser_Id(userId)
            .orElseThrow(() -> new InvalidPasswordChangeException("Usuário não encontrado."));

    if (!passwordEncoder.matches(request.currentPassword(), auth.getPasswordHash())) {
      throw new InvalidPasswordChangeException("Senha atual incorreta.");
    }

    if (!request.newPassword().equals(request.confirmNewPassword())) {
      throw new InvalidPasswordChangeException("A confirmação não confere com a nova senha.");
    }

    if (request.newPassword().equals(request.currentPassword())) {
      throw new InvalidPasswordChangeException("A nova senha deve ser diferente da senha atual.");
    }

    auth.changePasswordHash(passwordEncoder.encode(request.newPassword()));
    auth.setMustChangePassword(false);

    User user = auth.getUser();
    String token = jwtService.generateJwtToken(user, auth);

    return new LoginResponse(
        token,
        user.getId(),
        user.getFullName(),
        user.getAccessType(),
        user.hasAcceptedTerms(),
        auth.isMustChangePassword());
  }
}
