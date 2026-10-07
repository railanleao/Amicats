package org.amicats.backend.repository.sync;

import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.amicats.backend.domain.entity.Cat;
import org.amicats.backend.domain.entity.PrescribedMedication;
import org.amicats.backend.domain.entity.Room;
import org.amicats.backend.domain.entity.StockItem;
import org.amicats.backend.domain.interfaces.dataprovider.sync.SyncChangesDataProvider;
import org.amicats.backend.repository.cat.CatRepository;
import org.amicats.backend.repository.prescribedmedication.PrescribedMedicationRepository;
import org.amicats.backend.repository.room.RoomRepository;
import org.amicats.backend.repository.stock.StockItemRepository;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SyncChangesDataProviderImpl implements SyncChangesDataProvider {

  private final CatRepository catRepository;
  private final RoomRepository roomRepository;
  private final StockItemRepository stockItemRepository;
  private final PrescribedMedicationRepository prescribedMedicationRepository;

  @Override
  public List<Cat> findCatsUpdatedSince(LocalDateTime since) {
    return catRepository.findUpdatedSince(since);
  }

  @Override
  public List<Room> findRoomsUpdatedSince(LocalDateTime since) {
    return roomRepository.findUpdatedSince(since);
  }

  @Override
  public List<StockItem> findStockItemsUpdatedSince(LocalDateTime since) {
    return stockItemRepository.findUpdatedSince(since);
  }

  @Override
  public List<PrescribedMedication> findPrescribedMedicationsUpdatedSince(LocalDateTime since) {
    return prescribedMedicationRepository.findUpdatedSince(since);
  }
}
