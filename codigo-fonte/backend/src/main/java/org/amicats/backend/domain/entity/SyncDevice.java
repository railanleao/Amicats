package org.amicats.backend.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "sync_devices")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SyncDevice {

  @Id
  @Column(name = "device_id", length = 64)
  private String deviceId;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "id_user", nullable = false)
  private User user;

  @Column(name = "device_name", length = 100)
  private String deviceName;

  @Column(length = 20)
  private String platform;

  @Column(name = "app_version", length = 30)
  private String appVersion;

  @Column(name = "pending_count", nullable = false)
  private int pendingCount;

  @Column(name = "rejected_count", nullable = false)
  private int rejectedCount;

  @Column(name = "last_sync_at")
  private LocalDateTime lastSyncAt;

  @Column(name = "last_seen_at", nullable = false)
  private LocalDateTime lastSeenAt;

  public SyncDevice(String deviceId, User user) {
    this.deviceId = deviceId;
    this.user = user;
  }

  public void reportHeartbeat(
      User user,
      String deviceName,
      String platform,
      String appVersion,
      int pendingCount,
      int rejectedCount,
      LocalDateTime lastSyncAt,
      LocalDateTime seenAt) {
    this.user = user;
    this.deviceName = deviceName;
    this.platform = platform;
    this.appVersion = appVersion;
    this.pendingCount = pendingCount;
    this.rejectedCount = rejectedCount;
    this.lastSyncAt = lastSyncAt;
    this.lastSeenAt = seenAt;
  }
}
