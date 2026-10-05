package org.amicats.backend.controller.prescribedmedication;

import jakarta.validation.Valid;
import java.util.List;
import org.amicats.backend.domain.usecase.prescribedmedication.cancel.CancelPrescribedMedicationInput;
import org.amicats.backend.domain.usecase.prescribedmedication.read.ReadPrescribedMedicationOutput;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

public interface PrescribedMedicationController {

  @GetMapping("/cats/{catId}/prescribed-medications/active")
  List<ReadPrescribedMedicationOutput> listActive(@PathVariable Integer catId);

  @PatchMapping("/prescribed-medications/{id}/cancel")
  ReadPrescribedMedicationOutput cancel(
      @PathVariable Integer id,
      @Valid @RequestBody CancelPrescribedMedicationInput input,
      @AuthenticationPrincipal Jwt jwt);
}
