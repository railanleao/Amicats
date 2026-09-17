package org.amicats.backend.controller.user;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.amicats.backend.application.factory.user.CreateUserFactory;
import org.amicats.backend.application.factory.user.DeactivateUserFactory;
import org.amicats.backend.application.factory.user.ReadUserFactory;
import org.amicats.backend.application.factory.user.UpdateUserFactory;
import org.amicats.backend.domain.usecase.user.create.CreateUserInput;
import org.amicats.backend.domain.usecase.user.read.ReadUserOutput;
import org.amicats.backend.domain.usecase.user.update.UpdateUserInput;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class UserControllerImpl implements UserController {

  private final CreateUserFactory createUserFactory;
  private final ReadUserFactory readUserFactory;
  private final UpdateUserFactory updateUserFactory;
  private final DeactivateUserFactory deactivateUserFactory;

  @Override
  @PreAuthorize("hasRole('Administrator')")
  public List<ReadUserOutput> list() {
    return readUserFactory.create().findAll();
  }

  @Override
  @PreAuthorize("hasRole('Administrator')")
  public ReadUserOutput findById(Integer id) {
    return readUserFactory.create().findById(id);
  }

  @Override
  @PreAuthorize("hasRole('Administrator')")
  public ReadUserOutput create(CreateUserInput input) {
    return createUserFactory.create().execute(input);
  }

  @Override
  @PreAuthorize("hasRole('Administrator')")
  public ReadUserOutput update(Integer id, UpdateUserInput input) {
    return updateUserFactory.create().execute(id, input);
  }

  @Override
  @PreAuthorize("hasRole('Administrator')")
  public ResponseEntity<Void> deactivate(Integer id) {
    deactivateUserFactory.create().execute(id);
    return ResponseEntity.noContent().build();
  }
}
