package org.amicats.backend.domain.usecase.user.create;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.amicats.backend.domain.enums.AccessType;

public record CreateUserInput(
        @NotBlank String fullName,
        @NotBlank @Email String email,
        @NotBlank String password,
        String phoneNumber,
        String imageUrl,
        @NotNull AccessType accessType,
        String crmv,
        String ufCrmv
) {}