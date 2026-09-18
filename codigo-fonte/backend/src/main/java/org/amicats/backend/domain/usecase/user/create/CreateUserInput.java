package org.amicats.backend.domain.usecase.user.create;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.amicats.backend.domain.enums.AccessType;

public record CreateUserInput(
    @NotBlank String fullName,
    @NotBlank @Email String email,
    @NotBlank @Size(min = 8, max = 72) String password,
    String phoneNumber,
    String imageUrl,
    @NotNull AccessType accessType,
    String crmv,
    String ufCrmv) {}
