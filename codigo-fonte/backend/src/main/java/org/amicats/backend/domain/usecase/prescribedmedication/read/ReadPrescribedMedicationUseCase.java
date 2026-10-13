package org.amicats.backend.domain.usecase.prescribedmedication.read;

import java.time.Clock;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import lombok.Builder;
import org.amicats.backend.domain.interfaces.dataprovider.cat.CatDataProvider;
import org.amicats.backend.domain.interfaces.dataprovider.prescribedmedication.PrescribedMedicationDataProvider;
import org.amicats.backend.domain.policy.DoseAdministrationTimePolicy;
import org.amicats.backend.exception.ResourceNotFoundException;
import org.springframework.transaction.annotation.Transactional;

@Builder
public class ReadPrescribedMedicationUseCase {

  private CatDataProvider catDataProvider;
  private PrescribedMedicationDataProvider prescribedMedicationDataProvider;
  @Builder.Default private Clock clock = Clock.systemUTC();
  @Builder.Default private ZoneId clinicalZone = DoseAdministrationTimePolicy.DEFAULT_CLINICAL_ZONE;

  @Transactional(readOnly = true)
  public List<ReadPrescribedMedicationOutput> findActiveByCat(Integer catId) {
    catDataProvider
        .findById(catId)
        .orElseThrow(() -> new ResourceNotFoundException("Gato não encontrado."));

    LocalDate today =
        DoseAdministrationTimePolicy.clinicalDate(
            DoseAdministrationTimePolicy.nowUtc(clock), clinicalZone);

    return prescribedMedicationDataProvider.findActiveByCat(catId, today).stream()
        .map(pm -> ReadPrescribedMedicationOutput.from(pm, today))
        .toList();
  }
}
