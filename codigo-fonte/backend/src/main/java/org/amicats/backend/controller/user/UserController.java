package org.amicats.backend.controller.user;

import jakarta.validation.Valid;
import org.amicats.backend.domain.enums.AccessType;
import org.amicats.backend.domain.usecase.common.PagedResult;
import org.amicats.backend.domain.usecase.user.create.CreateUserInput;
import org.amicats.backend.domain.usecase.user.read.ReadUserOutput;
import org.amicats.backend.domain.usecase.user.status.ChangeUserStatusInput;
import org.amicats.backend.domain.usecase.user.update.UpdateUserInput;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RequestMapping("/users")
public interface UserController {

  @GetMapping
  PagedResult<ReadUserOutput> list(
      @RequestParam(required = false) String search,
      @RequestParam(required = false) AccessType accessType,
      @RequestParam(required = false) Boolean active,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size);

  @GetMapping("/{id}")
  ReadUserOutput findById(@PathVariable Integer id);

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  ReadUserOutput create(@Valid @RequestBody CreateUserInput input);

  @PutMapping("/{id}")
  ReadUserOutput update(
      @PathVariable Integer id,
      @Valid @RequestBody UpdateUserInput input,
      @AuthenticationPrincipal Jwt jwt);

  @PatchMapping("/{id}/status")
  ResponseEntity<Void> changeStatus(
      @PathVariable Integer id,
      @Valid @RequestBody ChangeUserStatusInput input,
      @AuthenticationPrincipal Jwt jwt);
}
