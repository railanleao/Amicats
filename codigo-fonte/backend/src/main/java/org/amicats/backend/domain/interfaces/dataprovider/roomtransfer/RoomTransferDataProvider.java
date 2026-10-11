package org.amicats.backend.domain.interfaces.dataprovider.roomtransfer;

import java.util.List;
import org.amicats.backend.domain.entity.RoomTransfer;

public interface RoomTransferDataProvider {

  RoomTransfer save(RoomTransfer roomTransfer);

  List<RoomTransfer> findByCatIdOrderByCreatedAtDesc(Integer catId);
}
