package org.amicats.backend.service;

import org.amicats.backend.dto.LoginDto.LoginRequest;
import org.amicats.backend.dto.LoginDto.LoginResponse;
import org.amicats.backend.exception.InvalidCredentialsException;
import org.amicats.backend.model.User;
import org.amicats.backend.model.UserAuth;
import org.amicats.backend.repository.UserAuthRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

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
    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {

        UserAuth auth = userAuthRepository
            .findByEmail(request.email())
            .orElseThrow(() ->
                new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Email ou senha inválidos")
            );
        
        User user = auth.getUser();

        if (!user.isActive()) {
            throw new InvalidCredentialsException();
        }

        boolean isValid = passwordEncoder.matches(
            request.password(),
            auth.getPasswordHash()
        );

        if (!isValid) {
            throw new InvalidCredentialsException();
        }

        String token = jwtService.generateJwtToken(user, auth);

        return new LoginResponse(
            token,
            user.getId(),
            user.getFullName(),
            user.getAccessType()
        );
    }
}
