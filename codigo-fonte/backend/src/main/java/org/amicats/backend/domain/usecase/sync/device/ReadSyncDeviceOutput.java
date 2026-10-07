package org.amicats.backend.domain.usecase.sync.device;

import java.time.LocalDateTime;
import org.amicats.backend.domain.entity.SyncDevice;
import org.amicats.backend.domain.enums.AccessType;
import org.amicats.backend.domain.enums.SyncDeviceStatus;

public record ReadSyncDeviceOutput(
    String deviceId,
    String deviceName,
    String platform,
    String appVersion,
    Integer userId,
    String userName,
    AccessType accessType,
    boolean userActive,
    int pendingCount,
    int rejectedCount,
    LocalDateTime lastSyncAt,
    LocalDateTime lastSeenAt,
    SyncDeviceStatus status) {

  public static ReadSyncDeviceOutput from(SyncDevice device) {
    var user = device.getUser();

    boolean hasPendingWork = device.getPendingCount() > 0 || device.getRejectedCount() > 0;

    return new ReadSyncDeviceOutput(
        device.getDeviceId(),
        device.getDeviceName(),
        device.getPlatform(),
        device.getAppVersion(),
        user.getId(),
        user.getFullName(),
        user.getAccessType(),
        user.isActive(),
        device.getPendingCount(),
        device.getRejectedCount(),
        device.getLastSyncAt(),
        device.getLastSeenAt(),
        hasPendingWork ? SyncDeviceStatus.Pending : SyncDeviceStatus.Synchronized);
  }
}
