package org.amicats.backend.repository.roomtransfer;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.amicats.backend.domain.entity.RoomTransfer;
import org.amicats.backend.domain.interfaces.dataprovider.roomtransfer.RoomTransferDataProvider;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RoomTransferDataProviderImpl implements RoomTransferDataProvider {

  private final RoomTransferRepository roomTransferRepository;

  @Override
  public RoomTransfer save(RoomTransfer roomTransfer) {
    return roomTransferRepository.save(roomTransfer);
  }

  @Override
  public List<RoomTransfer> findByCatIdOrderByCreatedAtDesc(Integer catId) {
    return roomTransferRepository.findByCat_IdOrderByCreatedAtDesc(catId);
  }
}
