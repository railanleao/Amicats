package org.amicats.backend.repository.externalattendance;

import java.util.List;
import org.amicats.backend.controller.externalattendance.ExternalAttendanceOutput;
import org.amicats.backend.domain.entity.ExternalAttendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ExternalAttendanceRepository extends JpaRepository<ExternalAttendance, Integer> {

  @Query(
      "select new org.amicats.backend.controller.externalattendance.ExternalAttendanceOutput("
          + "e.id, e.cat.id, e.partnerClinic, e.veterinarian, e.crmv, e.attendanceDate, "
          + "e.diagnosis, e.attachedFile, e.attachmentContentType, e.createdAt) "
          + "from ExternalAttendance e where e.cat.id = :catId "
          + "order by e.attendanceDate desc, e.createdAt desc")
  List<ExternalAttendanceOutput> findSummariesByCatId(@Param("catId") Integer catId);
}
