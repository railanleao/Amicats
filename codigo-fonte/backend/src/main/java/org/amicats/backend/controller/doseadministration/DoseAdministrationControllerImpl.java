package org.amicats.backend.controller.doseadministration;

import java.net.URI;
import lombok.RequiredArgsConstructor;
import org.amicats.backend.application.factory.doseadministration.ReadDoseAdministrationFactory;
import org.amicats.backend.application.factory.doseadministration.RegisterDoseAdministrationFactory;
import org.amicats.backend.domain.usecase.common.PagedResult;
import org.amicats.backend.domain.usecase.doseadministration.read.ReadDoseAdministrationOutput;
import org.amicats.backend.domain.usecase.doseadministration.register.RegisterDoseAdministrationInput;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class DoseAdministrationControllerImpl implements DoseAdministrationController {
  private final RegisterDoseAdministrationFactory registerFactory;
  private final ReadDoseAdministrationFactory readFactory;

  @Override
  @PreAuthorize("hasAnyRole('Administrator', 'Veterinarian', 'Assistant')")
  public ResponseEntity<ReadDoseAdministrationOutput> register(
      Integer id, RegisterDoseAdministrationInput input, Jwt jwt) {
    var result = registerFactory.create().execute(id, Integer.valueOf(jwt.getSubject()), input);
    if (result.created()) {
      return ResponseEntity.created(URI.create("/dose-administrations/" + result.dose().id()))
          .body(result.dose());
    }
    return ResponseEntity.ok(result.dose());
  }

  @Override
  @PreAuthorize("isAuthenticated()")
  public ReadDoseAdministrationOutput findById(Integer id, Jwt jwt) {
    return readFactory.create().findById(id, Integer.valueOf(jwt.getSubject()));
  }

  @Override
  @PreAuthorize("isAuthenticated()")
  public PagedResult<ReadDoseAdministrationOutput> findByMedication(
      Integer id, int page, int size, Jwt jwt) {
    return readFactory.create().findByMedication(id, Integer.valueOf(jwt.getSubject()), page, size);
  }

  @Override
  @PreAuthorize("isAuthenticated()")
  public PagedResult<ReadDoseAdministrationOutput> findByCat(
      Integer catId, int page, int size, Jwt jwt) {
    return readFactory.create().findByCat(catId, Integer.valueOf(jwt.getSubject()), page, size);
  }
}
