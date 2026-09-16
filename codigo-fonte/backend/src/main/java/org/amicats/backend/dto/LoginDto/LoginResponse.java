package org.amicats.backend.dto.LoginDto;

import org.amicats.backend.model.Enum.AccessType;

public record LoginResponse(
    String token,
    Integer id,
    String name,
    AccessType accessType
) {}
