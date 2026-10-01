package org.amicats.backend.controller.internalmedicalprescription;

import jakarta.validation.Valid;
import org.amicats.backend.domain.usecase.internalmedicalprescription.create.CreateInternalMedicalPrescriptionInput;
import org.amicats.backend.domain.usecase.internalmedicalprescription.read.ReadInternalMedicalPrescriptionOutput;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RequestMapping("/cats/{catId}/internal-medical-prescriptions")
public interface InternalMedicalPrescriptionController {

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  ReadInternalMedicalPrescriptionOutput create(
      @PathVariable Integer catId,
      @Valid @RequestBody CreateInternalMedicalPrescriptionInput input,
      @AuthenticationPrincipal Jwt jwt);
}
