package org.amicats.backend.domain.usecase.sync.device;

import java.time.Clock;
import java.time.LocalDateTime;
import lombok.Builder;
import org.amicats.backend.domain.entity.SyncDevice;
import org.amicats.backend.domain.entity.User;
import org.amicats.backend.domain.interfaces.dataprovider.sync.SyncDeviceDataProvider;
import org.amicats.backend.domain.interfaces.dataprovider.user.UserDataProvider;
import org.amicats.backend.exception.ResourceNotFoundException;
import org.springframework.transaction.annotation.Transactional;

@Builder
public class RegisterSyncHeartbeatUseCase {

  private SyncDeviceDataProvider syncDeviceDataProvider;
  private UserDataProvider userDataProvider;
  @Builder.Default private Clock clock = Clock.systemUTC();

  @Transactional
  public void execute(Integer userId, SyncHeartbeatInput input) {
    User user =
        userDataProvider
            .findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado."));

    LocalDateTime now = LocalDateTime.now(clock);

    SyncDevice device =
        syncDeviceDataProvider
            .findById(input.deviceId())
            .orElseGet(() -> new SyncDevice(input.deviceId(), user));

    LocalDateTime lastSyncAt =
        input.lastSyncAt() != null && input.lastSyncAt().isAfter(now) ? now : input.lastSyncAt();

    device.reportHeartbeat(
        user,
        input.deviceName(),
        input.platform(),
        input.appVersion(),
        input.pendingCount(),
        input.rejectedCount(),
        lastSyncAt,
        now);

    syncDeviceDataProvider.save(device);
  }
}
