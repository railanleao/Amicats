package org.amicats.backend.service;

import org.amicats.backend.dto.LoginDto.LoginRequest;
import org.amicats.backend.dto.LoginDto.LoginResponse;
import org.amicats.backend.model.User;
import org.amicats.backend.model.UserAuth;
import org.amicats.backend.repository.UsuarioAuthRepositorio;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UsuarioAuthRepositorio usuarioAuthRepositorio;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
        UsuarioAuthRepositorio usuarioAuthRepositorio,
        PasswordEncoder passwordEncoder,
        JwtService jwtService) {

        this.usuarioAuthRepositorio = usuarioAuthRepositorio;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }
    public LoginResponse login(LoginRequest request) {

        UserAuth auth = usuarioAuthRepositorio
            .findByEmail(request.email())
            .orElseThrow(() ->
                new RuntimeException("Email ou senha inválidos")
            );

        if (!auth.getUser().IsActive()) {
            throw new RuntimeException("Usuário inativo");
        }

        boolean senhaValida = passwordEncoder.matches(
            request.password(),
            auth.getPasswordHash()
        );

        if (!senhaValida) {
            throw new RuntimeException("Email ou senha inválidos");
        }

        User user = auth.getUser();

        String token = jwtService.gerarToken(user, auth);

        return new LoginResponse(
            token,
            user.getId(),
            user.getFullName(),
            auth.getEmail(),
            user.getAccessType()
        );
    }
}
