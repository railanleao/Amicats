package org.amicats.backend.domain.usecase.room.update;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record UpdateRoomInput(
    @NotBlank @Size(max = 100) String title,
    String description,
    @Size(max = 500) String coverImageUrl,
    @Positive Integer maxCapacity) {}
