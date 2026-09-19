package org.amicats.backend.domain.usecase.user.status;

import jakarta.validation.constraints.NotNull;

public record ChangeUserStatusInput(@NotNull Boolean active) {}
