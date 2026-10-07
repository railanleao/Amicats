package org.amicats.backend.domain.usecase.sync.device;

import java.util.List;
import lombok.Builder;
import org.amicats.backend.domain.interfaces.dataprovider.sync.SyncDeviceDataProvider;
import org.springframework.transaction.annotation.Transactional;

@Builder
public class ListSyncDevicesUseCase {

  private SyncDeviceDataProvider syncDeviceDataProvider;

  @Transactional(readOnly = true)
  public List<ReadSyncDeviceOutput> execute() {
    return syncDeviceDataProvider.findAllWithUser().stream()
        .map(ReadSyncDeviceOutput::from)
        .toList();
  }
}
