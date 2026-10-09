package org.amicats.backend.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "room_transfers")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class RoomTransfer {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id_room_transfer")
  private Integer id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "id_cat", nullable = false)
  private Cat cat;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "id_from_room")
  private Room fromRoom;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "id_to_room", nullable = false)
  private Room toRoom;

  @Column(nullable = false, length = 500)
  private String reason;

  @Column(name = "created_at", nullable = false)
  private LocalDateTime createdAt;

  public RoomTransfer(Cat cat, Room fromRoom, Room toRoom, String reason, LocalDateTime createdAt) {
    this.cat = cat;
    this.fromRoom = fromRoom;
    this.toRoom = toRoom;
    this.reason = reason;
    this.createdAt = createdAt;
  }
}
