package org.amicats.backend.service;

import org.amicats.backend.domain.entity.User;
import org.amicats.backend.domain.entity.UserAuth;
import org.amicats.backend.domain.usecase.userauth.LoginResponse;
import org.amicats.backend.exception.ResourceNotFoundException;
import org.amicats.backend.repository.user.UserAuthRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TermsAcceptanceService {

  private final UserAuthRepository userAuthRepository;
  private final JwtService jwtService;

  public TermsAcceptanceService(UserAuthRepository userAuthRepository, JwtService jwtService) {
    this.userAuthRepository = userAuthRepository;
    this.jwtService = jwtService;
  }

  @Transactional
  public LoginResponse acceptTerms(Integer userId) {

    UserAuth auth =
        userAuthRepository
            .findByUser_Id(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado: " + userId));

    User user = auth.getUser();
    user.acceptTerms();

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
