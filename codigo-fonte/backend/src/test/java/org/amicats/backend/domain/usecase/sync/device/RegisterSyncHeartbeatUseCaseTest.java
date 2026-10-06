package org.amicats.backend.domain.usecase.sync.device;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Optional;
import org.amicats.backend.domain.entity.SyncDevice;
import org.amicats.backend.domain.entity.User;
import org.amicats.backend.domain.enums.SyncDeviceStatus;
import org.amicats.backend.domain.interfaces.dataprovider.sync.SyncDeviceDataProvider;
import org.amicats.backend.domain.interfaces.dataprovider.user.UserDataProvider;
import org.amicats.backend.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class RegisterSyncHeartbeatUseCaseTest {

  private static final LocalDateTime NOW = LocalDateTime.of(2026, 10, 3, 12, 0);

  @Mock private SyncDeviceDataProvider syncDeviceDataProvider;
  @Mock private UserDataProvider userDataProvider;
  @Mock private User user;

  private RegisterSyncHeartbeatUseCase useCase;

  @BeforeEach
  void setUp() {
    Clock clock = Clock.fixed(Instant.parse("2026-10-03T12:00:00Z"), ZoneId.of("UTC"));
    useCase =
        RegisterSyncHeartbeatUseCase.builder()
            .syncDeviceDataProvider(syncDeviceDataProvider)
            .userDataProvider(userDataProvider)
            .clock(clock)
            .build();
  }

  @Test
  void registersANewDevice() {
    when(userDataProvider.findById(7)).thenReturn(Optional.of(user));
    when(syncDeviceDataProvider.findById("dev-1")).thenReturn(Optional.empty());

    useCase.execute(7, new SyncHeartbeatInput("dev-1", "Galaxy", "android", "1.0.0", 3, 1, NOW));

    ArgumentCaptor<SyncDevice> captor = ArgumentCaptor.forClass(SyncDevice.class);
    verify(syncDeviceDataProvider).save(captor.capture());
    SyncDevice saved = captor.getValue();
    assertThat(saved.getDeviceId()).isEqualTo("dev-1");
    assertThat(saved.getPendingCount()).isEqualTo(3);
    assertThat(saved.getRejectedCount()).isEqualTo(1);
    assertThat(saved.getLastSeenAt()).isEqualTo(NOW);
  }

  @Test
  void updatesAnExistingDeviceAndMovesItToTheLatestUser() {
    SyncDevice existing = new SyncDevice("dev-1", user);
    when(userDataProvider.findById(8)).thenReturn(Optional.of(user));
    when(syncDeviceDataProvider.findById("dev-1")).thenReturn(Optional.of(existing));

    useCase.execute(8, new SyncHeartbeatInput("dev-1", null, null, null, 0, 0, null));

    verify(syncDeviceDataProvider).save(existing);
    assertThat(existing.getPendingCount()).isZero();
  }

  @Test
  void clampsALastSyncInTheFuture() {
    when(userDataProvider.findById(7)).thenReturn(Optional.of(user));
    when(syncDeviceDataProvider.findById("dev-1")).thenReturn(Optional.empty());

    useCase.execute(7, new SyncHeartbeatInput("dev-1", null, null, null, 0, 0, NOW.plusHours(5)));

    ArgumentCaptor<SyncDevice> captor = ArgumentCaptor.forClass(SyncDevice.class);
    verify(syncDeviceDataProvider).save(captor.capture());
    assertThat(captor.getValue().getLastSyncAt()).isEqualTo(NOW);
  }

  @Test
  void rejectsAnUnknownUser() {
    when(userDataProvider.findById(99)).thenReturn(Optional.empty());

    assertThatThrownBy(
            () ->
                useCase.execute(99, new SyncHeartbeatInput("dev-1", null, null, null, 0, 0, null)))
        .isInstanceOf(ResourceNotFoundException.class);
    verify(syncDeviceDataProvider, org.mockito.Mockito.never()).save(any());
  }

  @Test
  void reportsPendingStatusWhenThereIsQueuedOrRejectedWork() {
    SyncDevice device = new SyncDevice("dev-1", user);
    when(user.getId()).thenReturn(7);
    when(user.getFullName()).thenReturn("Ana");
    device.reportHeartbeat(user, "Galaxy", "android", "1.0.0", 0, 2, NOW, NOW);

    assertThat(ReadSyncDeviceOutput.from(device).status()).isEqualTo(SyncDeviceStatus.Pending);

    device.reportHeartbeat(user, "Galaxy", "android", "1.0.0", 0, 0, NOW, NOW);

    assertThat(ReadSyncDeviceOutput.from(device).status()).isEqualTo(SyncDeviceStatus.Synchronized);
  }
}
