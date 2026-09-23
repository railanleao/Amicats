package org.amicats.backend.controller.room;

import lombok.RequiredArgsConstructor;
import org.amicats.backend.application.factory.room.ChangeRoomStatusFactory;
import org.amicats.backend.application.factory.room.CreateRoomFactory;
import org.amicats.backend.application.factory.room.ReadRoomFactory;
import org.amicats.backend.application.factory.room.UpdateRoomFactory;
import org.amicats.backend.domain.usecase.common.PagedResult;
import org.amicats.backend.domain.usecase.room.create.CreateRoomInput;
import org.amicats.backend.domain.usecase.room.read.ReadRoomOutput;
import org.amicats.backend.domain.usecase.room.read.RoomSearchCriteria;
import org.amicats.backend.domain.usecase.room.status.ChangeRoomStatusInput;
import org.amicats.backend.domain.usecase.room.update.UpdateRoomInput;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class RoomControllerImpl implements RoomController {

  private final CreateRoomFactory createRoomFactory;
  private final ReadRoomFactory readRoomFactory;
  private final UpdateRoomFactory updateRoomFactory;
  private final ChangeRoomStatusFactory changeRoomStatusFactory;

  // Widened beyond Administrator (UC-05's owner) because UC-06 also has the
  // Médico-Veterinário cadastrando o gato, which means picking its room.
  @Override
  @PreAuthorize("hasAnyRole('Administrator', 'Veterinarian')")
  public PagedResult<ReadRoomOutput> list(String search, Boolean active, int page, int size) {
    RoomSearchCriteria criteria = new RoomSearchCriteria(search, active, page, size);
    return readRoomFactory.create().search(criteria);
  }

  @Override
  @PreAuthorize("hasAnyRole('Administrator', 'Veterinarian')")
  public ReadRoomOutput findById(Integer id) {
    return readRoomFactory.create().findById(id);
  }

  @Override
  @PreAuthorize("hasRole('Administrator')")
  public ReadRoomOutput create(CreateRoomInput input) {
    return createRoomFactory.create().execute(input);
  }

  @Override
  @PreAuthorize("hasRole('Administrator')")
  public ReadRoomOutput update(Integer id, UpdateRoomInput input) {
    return updateRoomFactory.create().execute(id, input);
  }

  @Override
  @PreAuthorize("hasRole('Administrator')")
  public ResponseEntity<Void> changeStatus(Integer id, ChangeRoomStatusInput input) {
    changeRoomStatusFactory.create().execute(id, input.active());
    return ResponseEntity.noContent().build();
  }
}
