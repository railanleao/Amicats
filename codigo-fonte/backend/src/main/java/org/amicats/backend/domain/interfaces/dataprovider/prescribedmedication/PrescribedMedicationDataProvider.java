package org.amicats.backend.domain.interfaces.dataprovider.prescribedmedication;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.amicats.backend.domain.entity.PrescribedMedication;

public interface PrescribedMedicationDataProvider {

  PrescribedMedication save(PrescribedMedication prescribedMedication);

  Optional<PrescribedMedication> findById(Integer id);

  Optional<PrescribedMedication> findActiveByCatAndMedication(
      Integer catId, Integer medicationId, LocalDate today);

  List<PrescribedMedication> findActiveByCat(Integer catId, LocalDate today);
}
