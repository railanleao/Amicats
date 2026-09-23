package org.amicats.backend.controller.room;

import java.io.IOException;
import lombok.RequiredArgsConstructor;
import org.amicats.backend.application.factory.room.ChangeRoomStatusFactory;
import org.amicats.backend.application.factory.room.CreateRoomFactory;
import org.amicats.backend.application.factory.room.ReadRoomFactory;
import org.amicats.backend.application.factory.room.RoomPhotoFactory;
import org.amicats.backend.application.factory.room.UpdateRoomFactory;
import org.amicats.backend.domain.usecase.common.PagedResult;
import org.amicats.backend.domain.usecase.room.create.CreateRoomInput;
import org.amicats.backend.domain.usecase.room.read.ReadRoomOutput;
import org.amicats.backend.domain.usecase.room.read.RoomSearchCriteria;
import org.amicats.backend.domain.usecase.room.status.ChangeRoomStatusInput;
import org.amicats.backend.domain.usecase.room.update.UpdateRoomInput;
import org.amicats.backend.exception.InvalidPhotoException;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
public class RoomControllerImpl implements RoomController {

  private final CreateRoomFactory createRoomFactory;
  private final ReadRoomFactory readRoomFactory;
  private final UpdateRoomFactory updateRoomFactory;
  private final ChangeRoomStatusFactory changeRoomStatusFactory;
  private final RoomPhotoFactory roomPhotoFactory;

  @Override
  @PreAuthorize("isAuthenticated()")
  public PagedResult<ReadRoomOutput> list(String search, Boolean active, int page, int size) {
    RoomSearchCriteria criteria = new RoomSearchCriteria(search, active, page, size);
    return readRoomFactory.create().search(criteria);
  }

  @Override
  @PreAuthorize("isAuthenticated()")
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

  @Override
  @PreAuthorize("hasRole('Administrator')")
  public ReadRoomOutput uploadPhoto(Integer id, MultipartFile file) {
    try {
      return roomPhotoFactory.create().upload(id, file.getBytes());
    } catch (IOException e) {
      throw new InvalidPhotoException("Não foi possível ler o arquivo enviado.");
    }
  }

  @Override
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<byte[]> getPhoto(Integer id) {
    byte[] content = roomPhotoFactory.create().read(id);
    return ResponseEntity.ok().contentType(MediaType.IMAGE_JPEG).body(content);
  }

  @Override
  @PreAuthorize("hasRole('Administrator')")
  public ResponseEntity<Void> removePhoto(Integer id) {
    roomPhotoFactory.create().remove(id);
    return ResponseEntity.noContent().build();
  }
}
