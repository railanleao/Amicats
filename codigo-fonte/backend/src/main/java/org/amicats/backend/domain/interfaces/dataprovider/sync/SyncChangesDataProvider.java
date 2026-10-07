package org.amicats.backend.domain.interfaces.dataprovider.sync;

import java.time.LocalDateTime;
import java.util.List;
import org.amicats.backend.domain.entity.Cat;
import org.amicats.backend.domain.entity.PrescribedMedication;
import org.amicats.backend.domain.entity.Room;
import org.amicats.backend.domain.entity.StockItem;

public interface SyncChangesDataProvider {

  List<Cat> findCatsUpdatedSince(LocalDateTime since);

  List<Room> findRoomsUpdatedSince(LocalDateTime since);

  List<StockItem> findStockItemsUpdatedSince(LocalDateTime since);

  List<PrescribedMedication> findPrescribedMedicationsUpdatedSince(LocalDateTime since);
}
