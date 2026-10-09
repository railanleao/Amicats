package org.amicats.backend.domain.usecase.roomtransfer.create;

import java.time.Clock;
import java.time.LocalDateTime;
import lombok.Builder;
import org.amicats.backend.domain.entity.Cat;
import org.amicats.backend.domain.entity.Room;
import org.amicats.backend.domain.entity.RoomTransfer;
import org.amicats.backend.domain.interfaces.dataprovider.cat.CatDataProvider;
import org.amicats.backend.domain.interfaces.dataprovider.room.RoomDataProvider;
import org.amicats.backend.domain.interfaces.dataprovider.roomtransfer.RoomTransferDataProvider;
import org.amicats.backend.domain.usecase.cat.read.CatSearchCriteria;
import org.amicats.backend.domain.usecase.cat.read.ReadCatOutput;
import org.amicats.backend.exception.InvalidRoomTransferException;
import org.amicats.backend.exception.ResourceNotFoundException;
import org.springframework.transaction.annotation.Transactional;

@Builder
public class CreateRoomTransferUseCase {

  private CatDataProvider catDataProvider;
  private RoomDataProvider roomDataProvider;
  private RoomTransferDataProvider roomTransferDataProvider;
  @Builder.Default private Clock clock = Clock.systemUTC();

  @Transactional
  public ReadCatOutput execute(Integer catId, CreateRoomTransferInput input) {
    // Locks the cat row for the rest of the transaction: two concurrent transfers of the same
    // cat would otherwise both read the same fromRoom and both pass the capacity check against
    // the same stale occupancy count.
    Cat cat =
        catDataProvider
            .findByIdForUpdate(catId)
            .orElseThrow(() -> new ResourceNotFoundException("Gato não encontrado."));

    Room toRoom =
        roomDataProvider
            .findById(input.roomId())
            .orElseThrow(() -> new ResourceNotFoundException("Sala não encontrada."));

    Room fromRoom = cat.getRoom();

    if (fromRoom != null && fromRoom.getId().equals(toRoom.getId())) {
      throw new InvalidRoomTransferException("O gato já está nessa sala.");
    }

    if (toRoom.getMaxCapacity() != null && occupancyOf(toRoom) >= toRoom.getMaxCapacity()) {
      throw new InvalidRoomTransferException("A sala \"" + toRoom.getTitle() + "\" está lotada.");
    }

    cat.assignRoom(toRoom);
    catDataProvider.saveCat(cat);

    RoomTransfer roomTransfer =
        new RoomTransfer(cat, fromRoom, toRoom, input.reason().trim(), LocalDateTime.now(clock));
    roomTransferDataProvider.save(roomTransfer);

    return ReadCatOutput.from(cat);
  }

  private long occupancyOf(Room room) {
    return catDataProvider
        .search(new CatSearchCriteria(null, room.getId(), null, 0, 1))
        .totalElements();
  }
}
