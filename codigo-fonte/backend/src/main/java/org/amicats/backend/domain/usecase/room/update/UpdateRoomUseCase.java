package org.amicats.backend.domain.usecase.room.update;

import lombok.Builder;
import org.amicats.backend.domain.entity.Room;
import org.amicats.backend.domain.interfaces.dataprovider.room.RoomDataProvider;
import org.amicats.backend.domain.usecase.room.read.ReadRoomOutput;
import org.amicats.backend.exception.ResourceNotFoundException;
import org.springframework.transaction.annotation.Transactional;

@Builder
public class UpdateRoomUseCase {

  private RoomDataProvider roomDataProvider;

  @Transactional
  public ReadRoomOutput execute(Integer id, UpdateRoomInput input) {
    Room room =
        roomDataProvider
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Sala não encontrada: " + id));

    room.updateDetails(
        input.title(), input.description(), input.coverImageUrl(), input.maxCapacity());
    roomDataProvider.saveRoom(room);

    return ReadRoomOutput.from(room);
  }
}
