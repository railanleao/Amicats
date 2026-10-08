package org.amicats.backend.domain.usecase.doseadministration.read;

import lombok.Builder;
import org.amicats.backend.domain.entity.DoseAdministration;
import org.amicats.backend.domain.interfaces.dataprovider.cat.CatDataProvider;
import org.amicats.backend.domain.interfaces.dataprovider.doseadministration.DoseAdministrationDataProvider;
import org.amicats.backend.domain.interfaces.dataprovider.prescribedmedication.PrescribedMedicationDataProvider;
import org.amicats.backend.domain.interfaces.dataprovider.user.UserDataProvider;
import org.amicats.backend.domain.usecase.common.PagedResult;
import org.amicats.backend.domain.usecase.doseadministration.common.DoseAdministrationPolicy;
import org.amicats.backend.exception.ResourceNotFoundException;
import org.springframework.transaction.annotation.Transactional;

@Builder
public class ReadDoseAdministrationUseCase {
  private DoseAdministrationDataProvider doseAdministrationDataProvider;
  private PrescribedMedicationDataProvider prescribedMedicationDataProvider;
  private CatDataProvider catDataProvider;
  private UserDataProvider userDataProvider;

  @Transactional(readOnly = true)
  public ReadDoseAdministrationOutput findById(Integer id, Integer userId) {
    DoseAdministrationPolicy.requireActive(userDataProvider, userId);
    return ReadDoseAdministrationOutput.from(
        doseAdministrationDataProvider
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Registro de dose não encontrado.")));
  }

  @Transactional(readOnly = true)
  public PagedResult<ReadDoseAdministrationOutput> findByMedication(
      Integer medicationId, Integer userId, int page, int size) {
    DoseAdministrationPolicy.requireActive(userDataProvider, userId);
    prescribedMedicationDataProvider
        .findById(medicationId)
        .orElseThrow(() -> new ResourceNotFoundException("Medicação prescrita não encontrada."));
    return map(
        doseAdministrationDataProvider.findByMedication(
            medicationId, Math.max(0, page), size(size)));
  }

  @Transactional(readOnly = true)
  public PagedResult<ReadDoseAdministrationOutput> findByCat(
      Integer catId, Integer userId, int page, int size) {
    DoseAdministrationPolicy.requireActive(userDataProvider, userId);
    catDataProvider
        .findById(catId)
        .orElseThrow(() -> new ResourceNotFoundException("Gato não encontrado."));
    return map(doseAdministrationDataProvider.findByCat(catId, Math.max(0, page), size(size)));
  }

  private int size(int requested) {
    return requested <= 0 ? 20 : Math.min(requested, 100);
  }

  private PagedResult<ReadDoseAdministrationOutput> map(PagedResult<DoseAdministration> result) {
    return new PagedResult<>(
        result.content().stream().map(ReadDoseAdministrationOutput::from).toList(),
        result.page(),
        result.size(),
        result.totalElements(),
        result.totalPages());
  }
}
