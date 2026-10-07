package org.amicats.backend.controller.sync;

import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.amicats.backend.application.factory.sync.ListSyncDevicesFactory;
import org.amicats.backend.application.factory.sync.ReadSyncChangesFactory;
import org.amicats.backend.application.factory.sync.RegisterSyncHeartbeatFactory;
import org.amicats.backend.domain.enums.AccessType;
import org.amicats.backend.domain.usecase.sync.device.ReadSyncDeviceOutput;
import org.amicats.backend.domain.usecase.sync.device.SyncHeartbeatInput;
import org.amicats.backend.domain.usecase.sync.pull.SyncChangesOutput;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class SyncControllerImpl implements SyncController {

  private final ReadSyncChangesFactory readSyncChangesFactory;
  private final RegisterSyncHeartbeatFactory registerSyncHeartbeatFactory;
  private final ListSyncDevicesFactory listSyncDevicesFactory;

  @Override
  @PreAuthorize("isAuthenticated()")
  public SyncChangesOutput pull(LocalDateTime since, Jwt jwt) {
    AccessType role = AccessType.valueOf(jwt.getClaimAsString("role"));
    return readSyncChangesFactory.create().execute(since, role);
  }

  @Override
  @PreAuthorize("isAuthenticated()")
  public void heartbeat(SyncHeartbeatInput input, Jwt jwt) {
    registerSyncHeartbeatFactory.create().execute(Integer.valueOf(jwt.getSubject()), input);
  }

  @Override
  @PreAuthorize("hasRole('Administrator')")
  public List<ReadSyncDeviceOutput> listDevices() {
    return listSyncDevicesFactory.create().execute();
  }
}
