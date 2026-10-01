package org.amicats.backend.repository.internalmedicalprescription;

import lombok.RequiredArgsConstructor;
import org.amicats.backend.domain.entity.InternalMedicalPrescription;
import org.amicats.backend.domain.interfaces.dataprovider.internalmedicalprescription.InternalMedicalPrescriptionDataProvider;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class InternalMedicalPrescriptionDataProviderImpl
    implements InternalMedicalPrescriptionDataProvider {

  private final InternalMedicalPrescriptionRepository internalMedicalPrescriptionRepository;

  @Override
  public InternalMedicalPrescription save(InternalMedicalPrescription internalMedicalPrescription) {
    return internalMedicalPrescriptionRepository.save(internalMedicalPrescription);
  }
}
