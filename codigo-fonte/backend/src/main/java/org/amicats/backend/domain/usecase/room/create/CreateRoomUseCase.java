package org.amicats.backend.domain.usecase.room.create;

import lombok.Builder;
import org.amicats.backend.domain.entity.Room;
import org.amicats.backend.domain.interfaces.dataprovider.room.RoomDataProvider;
import org.amicats.backend.domain.usecase.room.read.ReadRoomOutput;
import org.springframework.transaction.annotation.Transactional;

@Builder
public class CreateRoomUseCase {

  private RoomDataProvider roomDataProvider;

  @Transactional
  public ReadRoomOutput execute(CreateRoomInput input) {
    Room room = new Room(input.title(), input.description(), null, input.maxCapacity());
    roomDataProvider.saveRoom(room);
    return ReadRoomOutput.from(room);
  }
}
