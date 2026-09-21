package org.amicats.backend.domain.usecase.room.read;

import org.amicats.backend.domain.entity.Room;

public record ReadRoomOutput(
    Integer id,
    String title,
    String description,
    String coverImageUrl,
    Integer maxCapacity,
    boolean active) {

  public static ReadRoomOutput from(Room room) {
    return new ReadRoomOutput(
        room.getId(),
        room.getTitle(),
        room.getDescription(),
        room.getCoverImageUrl(),
        room.getMaxCapacity(),
        room.isActive());
  }
}
