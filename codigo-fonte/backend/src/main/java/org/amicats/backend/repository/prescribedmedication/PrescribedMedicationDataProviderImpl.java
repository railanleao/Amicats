package org.amicats.backend.repository.prescribedmedication;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.amicats.backend.domain.entity.PrescribedMedication;
import org.amicats.backend.domain.enums.PrescribedMedicationStatus;
import org.amicats.backend.domain.interfaces.dataprovider.prescribedmedication.PrescribedMedicationDataProvider;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PrescribedMedicationDataProviderImpl implements PrescribedMedicationDataProvider {

  private final PrescribedMedicationRepository prescribedMedicationRepository;

  @Override
  public PrescribedMedication save(PrescribedMedication prescribedMedication) {
    return prescribedMedicationRepository.save(prescribedMedication);
  }

  @Override
  public Optional<PrescribedMedication> findById(Integer id) {
    return prescribedMedicationRepository.findById(id);
  }

  @Override
  public Optional<PrescribedMedication> findByIdForUpdate(Integer id) {
    return prescribedMedicationRepository.findByIdForUpdate(id);
  }

  @Override
  public Optional<PrescribedMedication> findActiveByCatAndMedication(
      Integer catId, Integer medicationId, LocalDate today) {
    return prescribedMedicationRepository
        .findActiveByCatAndMedication(catId, medicationId, PrescribedMedicationStatus.Active, today)
        .stream()
        .findFirst();
  }

  @Override
  public List<PrescribedMedication> findActiveByCat(Integer catId, LocalDate today) {
    return prescribedMedicationRepository.findActiveByCat(
        catId, PrescribedMedicationStatus.Active, today);
  }
}
