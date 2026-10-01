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
        photoPath(room),
        room.getMaxCapacity(),
        room.isActive());
  }

  private static String photoPath(Room room) {
    return room.getCoverImageUrl() == null ? null : "/rooms/" + room.getId() + "/photo";
  }
}
