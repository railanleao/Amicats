package org.amicats.backend.controller.doseadministration;

import jakarta.validation.Valid;
import org.amicats.backend.domain.usecase.common.PagedResult;
import org.amicats.backend.domain.usecase.doseadministration.read.ReadDoseAdministrationOutput;
import org.amicats.backend.domain.usecase.doseadministration.register.RegisterDoseAdministrationInput;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

public interface DoseAdministrationController {
  @PostMapping("/prescribed-medications/{id}/doses")
  ResponseEntity<ReadDoseAdministrationOutput> register(
    @PathVariable Integer id, @Valid @RequestBody RegisterDoseAdministrationInput input,
    @AuthenticationPrincipal Jwt jwt);

  @GetMapping("/dose-administrations/{id}")
  ReadDoseAdministrationOutput findById(@PathVariable Integer id, @AuthenticationPrincipal Jwt jwt);

  @GetMapping("/prescribed-medications/{id}/doses")
  PagedResult<ReadDoseAdministrationOutput> findByMedication(
    @PathVariable Integer id, @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "20") int size, @AuthenticationPrincipal Jwt jwt);

  @GetMapping("/cats/{catId}/doses")
  PagedResult<ReadDoseAdministrationOutput> findByCat(
    @PathVariable Integer catId, @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "20") int size, @AuthenticationPrincipal Jwt jwt);
}