package org.amicats.backend.controller.roomtransfer;

import jakarta.validation.Valid;
import java.util.List;
import org.amicats.backend.domain.usecase.cat.read.ReadCatOutput;
import org.amicats.backend.domain.usecase.roomtransfer.create.CreateRoomTransferInput;
import org.amicats.backend.domain.usecase.roomtransfer.read.ReadRoomTransferOutput;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

public interface RoomTransferController {

  @PostMapping("/cats/{catId}/room-transfers")
  @ResponseStatus(HttpStatus.CREATED)
  ReadCatOutput create(@PathVariable Integer catId, @Valid @RequestBody CreateRoomTransferInput input);

  @GetMapping("/cats/{catId}/room-transfers")
  List<ReadRoomTransferOutput> list(@PathVariable Integer catId);
}
