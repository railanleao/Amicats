package org.amicats.backend.repository.sync;

import java.util.List;
import org.amicats.backend.domain.entity.SyncDevice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface SyncDeviceRepository extends JpaRepository<SyncDevice, String> {

  @Query("select d from SyncDevice d join fetch d.user order by d.lastSeenAt desc")
  List<SyncDevice> findAllWithUser();
}
