package org.amicats.backend.domain.usecase.user.update;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.amicats.backend.domain.enums.AccessType;

public record UpdateUserInput(
        @NotBlank String fullName,
        String phoneNumber,
        String imageUrl,
        @NotNull AccessType accessType,
        String crmv,
        String ufCrmv) {}