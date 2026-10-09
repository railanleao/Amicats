package org.amicats.backend.domain.usecase.roomtransfer.read;

import java.util.List;
import lombok.Builder;
import org.amicats.backend.domain.interfaces.dataprovider.cat.CatDataProvider;
import org.amicats.backend.domain.interfaces.dataprovider.roomtransfer.RoomTransferDataProvider;
import org.amicats.backend.exception.ResourceNotFoundException;
import org.springframework.transaction.annotation.Transactional;

@Builder
public class ReadRoomTransferUseCase {

  private CatDataProvider catDataProvider;
  private RoomTransferDataProvider roomTransferDataProvider;

  @Transactional(readOnly = true)
  public List<ReadRoomTransferOutput> findByCat(Integer catId) {
    catDataProvider
        .findById(catId)
        .orElseThrow(() -> new ResourceNotFoundException("Gato não encontrado."));

    return roomTransferDataProvider.findByCatIdOrderByCreatedAtDesc(catId).stream()
        .map(ReadRoomTransferOutput::from)
        .toList();
  }
}
