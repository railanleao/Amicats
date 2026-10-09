package org.amicats.backend.repository.roomtransfer;

import java.util.List;
import org.amicats.backend.domain.entity.RoomTransfer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoomTransferRepository extends JpaRepository<RoomTransfer, Integer> {

  List<RoomTransfer> findByCat_IdOrderByCreatedAtDesc(Integer catId);
}
