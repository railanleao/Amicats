package org.amicats.backend.domain.usecase.room.status;

import lombok.Builder;
import org.amicats.backend.domain.entity.Room;
import org.amicats.backend.domain.interfaces.dataprovider.room.RoomDataProvider;
import org.amicats.backend.exception.ResourceNotFoundException;
import org.springframework.transaction.annotation.Transactional;

@Builder
public class ChangeRoomStatusUseCase {

  private RoomDataProvider roomDataProvider;

  @Transactional
  public void execute(Integer id, boolean active) {
    Room room =
        roomDataProvider
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Sala não encontrada: " + id));

    if (active) {
      room.activate();
    } else {
      room.deactivate();
    }
    roomDataProvider.saveRoom(room);
  }
}
