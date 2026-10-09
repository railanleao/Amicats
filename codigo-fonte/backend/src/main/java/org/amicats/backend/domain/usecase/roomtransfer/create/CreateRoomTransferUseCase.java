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
    Cat cat =
        catDataProvider
            .findById(catId)
            .orElseThrow(() -> new ResourceNotFoundException("Gato não encontrado."));

    Room toRoom =
        roomDataProvider
            .findById(input.roomId())
            .orElseThrow(() -> new ResourceNotFoundException("Sala não encontrada."));

    Room fromRoom = cat.getRoom();

    if (fromRoom != null && fromRoom.getId().equals(toRoom.getId())) {
      throw new InvalidRoomTransferException("O gato já está nessa sala.");
    }

    cat.assignRoom(toRoom);
    catDataProvider.saveCat(cat);

    RoomTransfer roomTransfer =
        new RoomTransfer(cat, fromRoom, toRoom, input.reason().trim(), LocalDateTime.now(clock));
    roomTransferDataProvider.save(roomTransfer);

    return ReadCatOutput.from(cat);
  }
}
