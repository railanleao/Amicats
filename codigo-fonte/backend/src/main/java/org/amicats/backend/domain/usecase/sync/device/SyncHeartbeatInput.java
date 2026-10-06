package org.amicats.backend.domain.usecase.sync.device;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

public record SyncHeartbeatInput(
    @NotBlank @Size(max = 64) String deviceId,
    @Size(max = 100) String deviceName,
    @Size(max = 20) String platform,
    @Size(max = 30) String appVersion,
    @Min(0) int pendingCount,
    @Min(0) int rejectedCount,
    LocalDateTime lastSyncAt) {}
