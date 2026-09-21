package org.amicats.backend.domain.usecase.room.create;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record CreateRoomInput(
    @NotBlank @Size(max = 100) String title,
    String description,
    @Size(max = 500) String coverImageUrl,
    @Positive Integer maxCapacity) {}
