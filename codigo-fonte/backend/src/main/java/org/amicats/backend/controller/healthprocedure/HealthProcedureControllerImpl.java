package org.amicats.backend.controller.healthprocedure;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.amicats.backend.application.factory.healthprocedure.CancelHealthProcedureFactory;
import org.amicats.backend.application.factory.healthprocedure.CompleteHealthProcedureFactory;
import org.amicats.backend.application.factory.healthprocedure.CreateHealthProcedureFactory;
import org.amicats.backend.application.factory.healthprocedure.ReadHealthProcedureFactory;
import org.amicats.backend.application.factory.healthprocedure.UpdateHealthProcedureFactory;
import org.amicats.backend.domain.enums.HealthProcedureStatus;
import org.amicats.backend.domain.enums.HealthProcedureType;
import org.amicats.backend.domain.usecase.common.PagedResult;
import org.amicats.backend.domain.usecase.healthprocedure.cancel.CancelHealthProcedureInput;
import org.amicats.backend.domain.usecase.healthprocedure.complete.CompleteHealthProcedureInput;
import org.amicats.backend.domain.usecase.healthprocedure.create.CreateHealthProcedureInput;
import org.amicats.backend.domain.usecase.healthprocedure.read.CatHealthSummaryOutput;
import org.amicats.backend.domain.usecase.healthprocedure.read.HealthProcedureSearchCriteria;
import org.amicats.backend.domain.usecase.healthprocedure.read.ReadHealthProcedureChangeOutput;
import org.amicats.backend.domain.usecase.healthprocedure.read.ReadHealthProcedureOutput;
import org.amicats.backend.domain.usecase.healthprocedure.update.UpdateHealthProcedureInput;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class HealthProcedureControllerImpl implements HealthProcedureController {

  private final ReadHealthProcedureFactory readHealthProcedureFactory;
  private final CreateHealthProcedureFactory createHealthProcedureFactory;
  private final UpdateHealthProcedureFactory updateHealthProcedureFactory;
  private final CompleteHealthProcedureFactory completeHealthProcedureFactory;
  private final CancelHealthProcedureFactory cancelHealthProcedureFactory;

  @Override
  @PreAuthorize("isAuthenticated()")
  public PagedResult<ReadHealthProcedureOutput> list(
      String search,
      Integer catId,
      HealthProcedureType type,
      HealthProcedureStatus status,
      int page,
      int size) {
    HealthProcedureSearchCriteria criteria =
        new HealthProcedureSearchCriteria(search, catId, type, status, page, size);
    return readHealthProcedureFactory.create().search(criteria);
  }

  @Override
  @PreAuthorize("isAuthenticated()")
  public ReadHealthProcedureOutput findById(Integer id) {
    return readHealthProcedureFactory.create().findById(id);
  }

  @Override
  @PreAuthorize("isAuthenticated()")
  public List<ReadHealthProcedureChangeOutput> listChanges(Integer id) {
    return readHealthProcedureFactory.create().listChanges(id);
  }

  @Override
  @PreAuthorize("isAuthenticated()")
  public CatHealthSummaryOutput summarize(Integer catId) {
    return readHealthProcedureFactory.create().summarize(catId);
  }

  @Override
  @PreAuthorize("hasAnyRole('Administrator', 'Veterinarian', 'Assistant')")
  public ReadHealthProcedureOutput create(CreateHealthProcedureInput input, Jwt jwt) {
    return createHealthProcedureFactory.create().execute(Integer.valueOf(jwt.getSubject()), input);
  }

  @Override
  @PreAuthorize("hasAnyRole('Administrator', 'Veterinarian', 'Assistant')")
  public ReadHealthProcedureOutput update(Integer id, UpdateHealthProcedureInput input, Jwt jwt) {
    return updateHealthProcedureFactory
        .create()
        .execute(id, Integer.valueOf(jwt.getSubject()), input);
  }

  @Override
  @PreAuthorize("hasAnyRole('Administrator', 'Veterinarian', 'Assistant')")
  public ReadHealthProcedureOutput complete(
      Integer id, CompleteHealthProcedureInput input, Jwt jwt) {
    return completeHealthProcedureFactory
        .create()
        .execute(id, Integer.valueOf(jwt.getSubject()), input);
  }

  @Override
  @PreAuthorize("hasAnyRole('Administrator', 'Veterinarian', 'Assistant')")
  public ReadHealthProcedureOutput cancel(Integer id, CancelHealthProcedureInput input, Jwt jwt) {
    return cancelHealthProcedureFactory
        .create()
        .execute(id, Integer.valueOf(jwt.getSubject()), input);
  }
}
