package org.amicats.backend.controller.sync;

import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;
import org.amicats.backend.domain.usecase.sync.device.ReadSyncDeviceOutput;
import org.amicats.backend.domain.usecase.sync.device.SyncHeartbeatInput;
import org.amicats.backend.domain.usecase.sync.pull.SyncChangesOutput;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RequestMapping("/sync")
public interface SyncController {

  @GetMapping("/pull")
  SyncChangesOutput pull(
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
          LocalDateTime since,
      @AuthenticationPrincipal Jwt jwt);

  @PostMapping("/heartbeat")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  void heartbeat(@Valid @RequestBody SyncHeartbeatInput input, @AuthenticationPrincipal Jwt jwt);

  @GetMapping("/devices")
  List<ReadSyncDeviceOutput> listDevices();
}
