package org.amicats.backend.domain.usecase.roomtransfer.create;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateRoomTransferInput(
    @NotNull Integer roomId, @NotBlank @Size(max = 500) String reason) {}
