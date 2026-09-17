package org.amicats.backend.domain.usecase.userauth;

import org.amicats.backend.domain.enums.AccessType;

public record LoginResponse(String token, Integer id, String name, AccessType accessType) {}
