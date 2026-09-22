package org.amicats.backend.controller.room;

import jakarta.validation.Valid;
import org.amicats.backend.domain.usecase.common.PagedResult;
import org.amicats.backend.domain.usecase.room.create.CreateRoomInput;
import org.amicats.backend.domain.usecase.room.read.ReadRoomOutput;
import org.amicats.backend.domain.usecase.room.status.ChangeRoomStatusInput;
import org.amicats.backend.domain.usecase.room.update.UpdateRoomInput;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RequestMapping("/rooms")
public interface RoomController {

  @GetMapping
  PagedResult<ReadRoomOutput> list(
      @RequestParam(required = false) String search,
      @RequestParam(required = false) Boolean active,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size);

  @GetMapping("/{id}")
  ReadRoomOutput findById(@PathVariable Integer id);

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  ReadRoomOutput create(@Valid @RequestBody CreateRoomInput input);

  @PutMapping("/{id}")
  ReadRoomOutput update(@PathVariable Integer id, @Valid @RequestBody UpdateRoomInput input);

  @PatchMapping("/{id}/status")
  ResponseEntity<Void> changeStatus(
      @PathVariable Integer id, @Valid @RequestBody ChangeRoomStatusInput input);

  @PutMapping(path = "/{id}/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  ReadRoomOutput uploadPhoto(@PathVariable Integer id, @RequestPart("file") MultipartFile file);

  @GetMapping("/{id}/photo")
  ResponseEntity<byte[]> getPhoto(@PathVariable Integer id);

  @DeleteMapping("/{id}/photo")
  ResponseEntity<Void> removePhoto(@PathVariable Integer id);
}
