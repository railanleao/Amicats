package org.amicats.backend.controller.prescribedmedication;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.amicats.backend.application.factory.prescribedmedication.CancelPrescribedMedicationFactory;
import org.amicats.backend.application.factory.prescribedmedication.ReadPrescribedMedicationFactory;
import org.amicats.backend.domain.usecase.prescribedmedication.cancel.CancelPrescribedMedicationInput;
import org.amicats.backend.domain.usecase.prescribedmedication.read.ReadPrescribedMedicationOutput;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class PrescribedMedicationControllerImpl implements PrescribedMedicationController {

  private final ReadPrescribedMedicationFactory readPrescribedMedicationFactory;
  private final CancelPrescribedMedicationFactory cancelPrescribedMedicationFactory;

  @Override
  @PreAuthorize("isAuthenticated()")
  public List<ReadPrescribedMedicationOutput> listActive(Integer catId) {
    return readPrescribedMedicationFactory.create().findActiveByCat(catId);
  }

  @Override
  @PreAuthorize("hasRole('Veterinarian')")
  public ReadPrescribedMedicationOutput cancel(
      Integer id, CancelPrescribedMedicationInput input, Jwt jwt) {
    return cancelPrescribedMedicationFactory
        .create()
        .execute(id, Integer.valueOf(jwt.getSubject()), input);
  }
}
