package org.amicats.backend.repository.externalattendance;

import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.amicats.backend.domain.entity.ExternalAttendance;
import org.amicats.backend.domain.interfaces.dataprovider.externalattendance.ExternalAttendanceDataProvider;
import org.amicats.backend.domain.usecase.externalattendance.read.ReadExternalAttendanceOutput;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ExternalAttendanceDataProviderImpl implements ExternalAttendanceDataProvider {

  private final ExternalAttendanceRepository externalAttendanceRepository;

  @Override
  public ExternalAttendance save(ExternalAttendance attendance) {
    return externalAttendanceRepository.save(attendance);
  }

  @Override
  public Optional<ExternalAttendance> findById(Integer id) {
    return externalAttendanceRepository.findById(id);
  }

  @Override
  public List<ReadExternalAttendanceOutput> findSummariesByCatId(Integer catId) {
    return externalAttendanceRepository.findSummariesByCatId(catId);
  }
}
