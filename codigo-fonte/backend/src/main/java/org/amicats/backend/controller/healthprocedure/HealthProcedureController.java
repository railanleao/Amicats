package org.amicats.backend.controller.healthprocedure;

import jakarta.validation.Valid;
import java.util.List;
import org.amicats.backend.domain.enums.HealthProcedureStatus;
import org.amicats.backend.domain.enums.HealthProcedureType;
import org.amicats.backend.domain.usecase.common.PagedResult;
import org.amicats.backend.domain.usecase.healthprocedure.cancel.CancelHealthProcedureInput;
import org.amicats.backend.domain.usecase.healthprocedure.complete.CompleteHealthProcedureInput;
import org.amicats.backend.domain.usecase.healthprocedure.create.CreateHealthProcedureInput;
import org.amicats.backend.domain.usecase.healthprocedure.read.CatHealthSummaryOutput;
import org.amicats.backend.domain.usecase.healthprocedure.read.ReadHealthProcedureChangeOutput;
import org.amicats.backend.domain.usecase.healthprocedure.read.ReadHealthProcedureOutput;
import org.amicats.backend.domain.usecase.healthprocedure.update.UpdateHealthProcedureInput;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

public interface HealthProcedureController {

  @GetMapping("/health-procedures")
  PagedResult<ReadHealthProcedureOutput> list(
      @RequestParam(required = false) String search,
      @RequestParam(required = false) Integer catId,
      @RequestParam(required = false) HealthProcedureType type,
      @RequestParam(required = false) HealthProcedureStatus status,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size);

  @GetMapping("/health-procedures/{id}")
  ReadHealthProcedureOutput findById(@PathVariable Integer id);

  @GetMapping("/health-procedures/{id}/changes")
  List<ReadHealthProcedureChangeOutput> listChanges(@PathVariable Integer id);

  @GetMapping("/cats/{catId}/health-summary")
  CatHealthSummaryOutput summarize(@PathVariable Integer catId);

  @PostMapping("/health-procedures")
  @ResponseStatus(HttpStatus.CREATED)
  ReadHealthProcedureOutput create(
      @Valid @RequestBody CreateHealthProcedureInput input, @AuthenticationPrincipal Jwt jwt);

  @PutMapping("/health-procedures/{id}")
  ReadHealthProcedureOutput update(
      @PathVariable Integer id,
      @Valid @RequestBody UpdateHealthProcedureInput input,
      @AuthenticationPrincipal Jwt jwt);

  @PatchMapping("/health-procedures/{id}/complete")
  ReadHealthProcedureOutput complete(
      @PathVariable Integer id,
      @Valid @RequestBody CompleteHealthProcedureInput input,
      @AuthenticationPrincipal Jwt jwt);

  @PatchMapping("/health-procedures/{id}/cancel")
  ReadHealthProcedureOutput cancel(
      @PathVariable Integer id,
      @Valid @RequestBody CancelHealthProcedureInput input,
      @AuthenticationPrincipal Jwt jwt);
}
