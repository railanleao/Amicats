package org.amicats.backend.domain.usecase.cat.update;

import lombok.Builder;
import org.amicats.backend.domain.entity.Cat;
import org.amicats.backend.domain.entity.Room;
import org.amicats.backend.domain.interfaces.dataprovider.cat.CatDataProvider;
import org.amicats.backend.domain.interfaces.dataprovider.room.RoomDataProvider;
import org.amicats.backend.domain.usecase.cat.read.ReadCatOutput;
import org.amicats.backend.exception.ResourceNotFoundException;
import org.springframework.transaction.annotation.Transactional;

@Builder
public class UpdateCatUseCase {

  private CatDataProvider catDataProvider;
  private RoomDataProvider roomDataProvider;

  @Transactional
  public ReadCatOutput execute(Integer id, UpdateCatInput input) {
    Cat cat =
        catDataProvider
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Gato não encontrado: " + id));

    Room room = input.roomId() != null ? findRoom(input.roomId()) : null;

    cat.updateBasicInfo(input.name(), input.sex(), input.coat(), input.characteristics());
    cat.updateBirthDate(input.estimatedBirthDate());
    cat.assignRoom(room);
    cat.changeGeneralStatus(
        input.generalStatus() != null ? input.generalStatus() : cat.getGeneralStatus());
    cat.updateWeight(input.weightKg());
    cat.updateMicrochip(input.microchip());
    cat.updateRescueInfo(input.rescueDate(), input.foundConditions());
    cat.updateSponsor(input.sponsorName(), input.sponsorPhone(), input.sponsorFunding());

    catDataProvider.saveCat(cat);
    return ReadCatOutput.from(cat);
  }

  private Room findRoom(Integer roomId) {
    return roomDataProvider
        .findById(roomId)
        .orElseThrow(() -> new ResourceNotFoundException("Sala não encontrada: " + roomId));
  }
}
