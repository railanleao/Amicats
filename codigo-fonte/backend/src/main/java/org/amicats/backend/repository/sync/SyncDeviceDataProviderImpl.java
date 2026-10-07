package org.amicats.backend.repository.sync;

import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.amicats.backend.domain.entity.SyncDevice;
import org.amicats.backend.domain.interfaces.dataprovider.sync.SyncDeviceDataProvider;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SyncDeviceDataProviderImpl implements SyncDeviceDataProvider {

  private final SyncDeviceRepository syncDeviceRepository;

  @Override
  public SyncDevice save(SyncDevice device) {
    return syncDeviceRepository.save(device);
  }

  @Override
  public Optional<SyncDevice> findById(String deviceId) {
    return syncDeviceRepository.findById(deviceId);
  }

  @Override
  public List<SyncDevice> findAllWithUser() {
    return syncDeviceRepository.findAllWithUser();
  }
}
