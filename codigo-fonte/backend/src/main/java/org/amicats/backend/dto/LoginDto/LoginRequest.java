package org.amicats.backend.dto.LoginDto;

public record LoginRequest(
    String email,
    String password
) {}
