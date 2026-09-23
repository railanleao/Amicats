package org.amicats.backend.domain.usecase.cat.create;

import java.util.List;
import lombok.Builder;
import org.amicats.backend.domain.entity.Cat;
import org.amicats.backend.domain.entity.Room;
import org.amicats.backend.domain.entity.User;
import org.amicats.backend.domain.interfaces.dataprovider.cat.CatDataProvider;
import org.amicats.backend.domain.interfaces.dataprovider.room.RoomDataProvider;
import org.amicats.backend.domain.interfaces.dataprovider.user.UserDataProvider;
import org.amicats.backend.domain.usecase.cat.read.ReadCatOutput;
import org.amicats.backend.exception.ResourceNotFoundException;
import org.springframework.transaction.annotation.Transactional;

@Builder
public class CreateCatUseCase {

  private CatDataProvider catDataProvider;
  private RoomDataProvider roomDataProvider;
  private UserDataProvider userDataProvider;

  @Transactional
  public ReadCatOutput execute(CreateCatInput input, Integer createdByUserId) {
    Room room = input.roomId() != null ? findRoom(input.roomId()) : null;
    User createdBy = createdByUserId != null ? findUser(createdByUserId) : null;

    Cat cat =
        new Cat(
            input.name(),
            room,
            input.sex(),
            input.estimatedAge(),
            input.coat(),
            input.microchip(),
            input.fiv(),
            input.felv(),
            input.pif(),
            input.neutered(),
            input.clinicalStatus(),
            input.healthNotes(),
            input.rescueDate(),
            input.rescueLocation(),
            input.sponsorName(),
            input.sponsorPhone(),
            input.sponsorCoverage(),
            createdBy);

    catDataProvider.saveCat(cat);
    return ReadCatOutput.from(cat, List.of());
  }

  private Room findRoom(Integer roomId) {
    return roomDataProvider
        .findById(roomId)
        .orElseThrow(() -> new ResourceNotFoundException("Sala não encontrada: " + roomId));
  }

  private User findUser(Integer userId) {
    return userDataProvider
        .findById(userId)
        .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado: " + userId));
  }
}
