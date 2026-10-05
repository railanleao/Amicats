package org.amicats.backend.domain.usecase.room.status;

import jakarta.validation.constraints.NotNull;

public record ChangeRoomStatusInput(@NotNull Boolean active) {}
