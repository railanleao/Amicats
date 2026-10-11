package org.amicats.backend.domain.usecase.roomtransfer.read;

import java.time.LocalDateTime;
import org.amicats.backend.domain.entity.Room;
import org.amicats.backend.domain.entity.RoomTransfer;

public record ReadRoomTransferOutput(
    Integer id,
    Integer catId,
    Integer fromRoomId,
    String fromRoomTitle,
    Integer toRoomId,
    String toRoomTitle,
    String reason,
    LocalDateTime createdAt) {

  public static ReadRoomTransferOutput from(RoomTransfer roomTransfer) {
    Room fromRoom = roomTransfer.getFromRoom();
    Room toRoom = roomTransfer.getToRoom();

    return new ReadRoomTransferOutput(
        roomTransfer.getId(),
        roomTransfer.getCat().getId(),
        fromRoom == null ? null : fromRoom.getId(),
        fromRoom == null ? null : fromRoom.getTitle(),
        toRoom.getId(),
        toRoom.getTitle(),
        roomTransfer.getReason(),
        roomTransfer.getCreatedAt());
  }
}
