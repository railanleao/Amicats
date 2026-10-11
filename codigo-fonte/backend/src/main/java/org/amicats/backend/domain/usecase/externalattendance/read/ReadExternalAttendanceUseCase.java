package org.amicats.backend.domain.usecase.externalattendance.read;

import java.util.List;
import lombok.Builder;
import org.amicats.backend.domain.entity.ExternalAttendance;
import org.amicats.backend.domain.interfaces.dataprovider.cat.CatDataProvider;
import org.amicats.backend.domain.interfaces.dataprovider.externalattendance.ExternalAttendanceDataProvider;
import org.amicats.backend.exception.ResourceNotFoundException;
import org.springframework.transaction.annotation.Transactional;

@Builder
public class ReadExternalAttendanceUseCase {

  private CatDataProvider catDataProvider;
  private ExternalAttendanceDataProvider externalAttendanceDataProvider;

  @Transactional(readOnly = true)
  public List<ReadExternalAttendanceOutput> findByCat(Integer catId) {
    catDataProvider
        .findById(catId)
        .orElseThrow(() -> new ResourceNotFoundException("Gato não encontrado."));

    return externalAttendanceDataProvider.findSummariesByCatId(catId);
  }

  @Transactional(readOnly = true)
  public ExternalAttendance findAttachment(Integer id) {
    return externalAttendanceDataProvider
        .findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Atendimento não encontrado."));
  }
}
