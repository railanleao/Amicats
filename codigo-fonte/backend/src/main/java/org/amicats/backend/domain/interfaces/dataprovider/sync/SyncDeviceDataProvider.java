package org.amicats.backend.domain.interfaces.dataprovider.sync;

import java.util.List;
import java.util.Optional;
import org.amicats.backend.domain.entity.SyncDevice;

public interface SyncDeviceDataProvider {

  SyncDevice save(SyncDevice device);

  Optional<SyncDevice> findById(String deviceId);

  List<SyncDevice> findAllWithUser();
}
