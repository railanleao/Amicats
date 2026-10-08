package org.amicats.backend.repository.externalattendance;

import java.util.List;
import org.amicats.backend.domain.entity.ExternalAttendance;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExternalAttendanceRepository extends JpaRepository<ExternalAttendance, Integer> {
  List<ExternalAttendance> findAllByCat_IdOrderByAttendanceDateDescCreatedAtDesc(Integer catId);
}
