package org.amicats.backend.domain.interfaces.dataprovider.doseadministration;

import java.util.Optional;
import java.util.UUID;
import org.amicats.backend.domain.entity.DoseAdministration;
import org.amicats.backend.domain.entity.PrescribedMedication;
import org.amicats.backend.domain.usecase.common.PagedResult;

public interface DoseAdministrationDataProvider {
  Optional<PrescribedMedication> findMedicationForUpdate(Integer id);
  Optional<DoseAdministration> findById(Integer id);
  Optional<DoseAdministration> findByClientOperationId(UUID operationId);
  InsertResult insertIfAbsent(DoseAdministration dose);
  PagedResult<DoseAdministration> findByMedication(Integer medicationId, int page, int size);
  PagedResult<DoseAdministration> findByCat(Integer catId, int page, int size);

  record InsertResult(DoseAdministration dose, boolean created) {}
}