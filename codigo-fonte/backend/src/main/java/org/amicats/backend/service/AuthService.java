package org.amicats.backend.service;

import org.amicats.backend.dto.LoginDto.LoginRequest;
import org.amicats.backend.dto.LoginDto.LoginResponse;
import org.amicats.backend.model.User;
import org.amicats.backend.model.UserAuth;
import org.amicats.backend.repository.UserAuthRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserAuthRepository userAuthRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
        UserAuthRepository userAuthRepository,
        PasswordEncoder passwordEncoder,
        JwtService jwtService) {

        this.userAuthRepository = userAuthRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }
    public LoginResponse login(LoginRequest request) {

        UserAuth auth = userAuthRepository
            .findByEmail(request.email())
            .orElseThrow(() ->
                new RuntimeException("Email ou senha inválidos")
            );

        if (!auth.getUser().IsActive()) {
            throw new RuntimeException("Usuário inativo");
        }

        boolean isValid = passwordEncoder.matches(
            request.password(),
            auth.getPasswordHash()
        );

        if (!isValid) {
            throw new RuntimeException("Email ou senha inválidos");
        }

        User user = auth.getUser();

        String token = jwtService.generateJwtToken(user, auth);

        return new LoginResponse(
            token,
            user.getId(),
            user.getFullName(),
            user.getAccessType()
        );
    }
}
