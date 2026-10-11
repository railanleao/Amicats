package org.amicats.backend.controller.roomtransfer;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.amicats.backend.application.factory.roomtransfer.CreateRoomTransferFactory;
import org.amicats.backend.application.factory.roomtransfer.ReadRoomTransferFactory;
import org.amicats.backend.domain.usecase.cat.read.ReadCatOutput;
import org.amicats.backend.domain.usecase.roomtransfer.create.CreateRoomTransferInput;
import org.amicats.backend.domain.usecase.roomtransfer.read.ReadRoomTransferOutput;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class RoomTransferControllerImpl implements RoomTransferController {

  private final CreateRoomTransferFactory createRoomTransferFactory;
  private final ReadRoomTransferFactory readRoomTransferFactory;

  // Same role restriction as editing a cat's registration (RF-005 / UC-06): Administrador and
  // Médico-Veterinário.
  @Override
  @PreAuthorize("hasAnyRole('Administrator', 'Veterinarian')")
  public ReadCatOutput create(Integer catId, CreateRoomTransferInput input) {
    return createRoomTransferFactory.create().execute(catId, input);
  }

  @Override
  @PreAuthorize("isAuthenticated()")
  public List<ReadRoomTransferOutput> list(Integer catId) {
    return readRoomTransferFactory.create().findByCat(catId);
  }
}
