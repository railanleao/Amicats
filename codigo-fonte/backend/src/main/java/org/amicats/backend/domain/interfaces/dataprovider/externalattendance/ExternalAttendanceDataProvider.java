package org.amicats.backend.domain.interfaces.dataprovider.externalattendance;

import java.util.List;
import java.util.Optional;
import org.amicats.backend.domain.entity.ExternalAttendance;
import org.amicats.backend.domain.usecase.externalattendance.read.ReadExternalAttendanceOutput;

public interface ExternalAttendanceDataProvider {

  ExternalAttendance save(ExternalAttendance attendance);

  Optional<ExternalAttendance> findById(Integer id);

  List<ReadExternalAttendanceOutput> findSummariesByCatId(Integer catId);
}
