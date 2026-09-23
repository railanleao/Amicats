package org.amicats.backend.domain.usecase.cat.create;

import lombok.Builder;
import org.amicats.backend.domain.entity.Cat;
import org.amicats.backend.domain.entity.Room;
import org.amicats.backend.domain.entity.User;
import org.amicats.backend.domain.enums.GeneralStatus;
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
    User createdBy = findUser(createdByUserId);

    Cat cat =
        new Cat(
            input.name(),
            room,
            input.sex(),
            input.estimatedBirthDate(),
            input.coat(),
            input.weightKg(),
            input.characteristics(),
            // "Em triagem" is the natural default for a cat that was just registered and hasn't
            // been examined yet — the Paper design for "Novo gato" doesn't mark this field as
            // required, so this keeps the form quick to fill (RNF-007) while still satisfying the
            // NOT NULL column.
            input.generalStatus() != null ? input.generalStatus() : GeneralStatus.InTriage,
            input.microchip(),
            input.rescueDate(),
            input.foundConditions(),
            input.sponsorName(),
            input.sponsorPhone(),
            input.sponsorFunding(),
            createdBy);

    catDataProvider.saveCat(cat);
    return ReadCatOutput.from(cat);
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
