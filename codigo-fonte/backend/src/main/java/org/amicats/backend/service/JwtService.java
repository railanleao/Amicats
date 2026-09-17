package org.amicats.backend.service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import org.amicats.backend.model.User;
import org.amicats.backend.model.UserAuth;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

    private final JwtEncoder jwtEncoder;

    public JwtService(JwtEncoder jwtEncoder) {
        this.jwtEncoder = jwtEncoder;
    }

    public String generateJwtToken(User user, UserAuth auth) {

        Instant now = Instant.now();

        JwtClaimsSet claims = JwtClaimsSet.builder()
            .issuer("amicats-api")
            .issuedAt(now)
            .expiresAt(now.plus(1, ChronoUnit.HOURS))
            .subject(user.getId().toString())
            .claim("email", auth.getEmail())
            .claim("name", user.getFullName())
            .claim("role", user.getAccessType().name())
            .build();

        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();

        return jwtEncoder
            .encode(JwtEncoderParameters.from(header, claims))
            .getTokenValue();
    }
}
