package org.amicats.backend.controller.internalmedicalprescription;

import lombok.RequiredArgsConstructor;
import org.amicats.backend.application.factory.internalmedicalprescription.CreateInternalMedicalPrescriptionFactory;
import org.amicats.backend.domain.usecase.internalmedicalprescription.create.CreateInternalMedicalPrescriptionInput;
import org.amicats.backend.domain.usecase.internalmedicalprescription.read.ReadInternalMedicalPrescriptionOutput;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class InternalMedicalPrescriptionControllerImpl
    implements InternalMedicalPrescriptionController {

  private final CreateInternalMedicalPrescriptionFactory createInternalMedicalPrescriptionFactory;

  @Override
  @PreAuthorize("hasRole('Veterinarian')")
  public ReadInternalMedicalPrescriptionOutput create(
      Integer catId, CreateInternalMedicalPrescriptionInput input, Jwt jwt) {
    return createInternalMedicalPrescriptionFactory
        .create()
        .execute(catId, Integer.valueOf(jwt.getSubject()), input);
  }
}
