package org.amicats.backend.controller.user;

import java.io.IOException;
import lombok.RequiredArgsConstructor;
import org.amicats.backend.application.factory.user.ChangeUserStatusFactory;
import org.amicats.backend.application.factory.user.CreateUserFactory;
import org.amicats.backend.application.factory.user.ReadUserFactory;
import org.amicats.backend.application.factory.user.UpdateUserFactory;
import org.amicats.backend.application.factory.user.UserPhotoFactory;
import org.amicats.backend.domain.enums.AccessType;
import org.amicats.backend.domain.usecase.common.PagedResult;
import org.amicats.backend.domain.usecase.user.create.CreateUserInput;
import org.amicats.backend.domain.usecase.user.read.ReadUserOutput;
import org.amicats.backend.domain.usecase.user.read.UserSearchCriteria;
import org.amicats.backend.domain.usecase.user.status.ChangeUserStatusInput;
import org.amicats.backend.domain.usecase.user.update.UpdateUserInput;
import org.amicats.backend.exception.InvalidPhotoException;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
public class UserControllerImpl implements UserController {

  private final CreateUserFactory createUserFactory;
  private final ReadUserFactory readUserFactory;
  private final UpdateUserFactory updateUserFactory;
  private final ChangeUserStatusFactory changeUserStatusFactory;
  private final UserPhotoFactory userPhotoFactory;

  @Override
  @PreAuthorize("hasRole('Administrator')")
  public PagedResult<ReadUserOutput> list(
      String search, AccessType accessType, Boolean active, int page, int size) {
    UserSearchCriteria criteria = new UserSearchCriteria(search, accessType, active, page, size);
    return readUserFactory.create().search(criteria);
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
  public ReadUserOutput update(Integer id, UpdateUserInput input, Jwt jwt) {
    return updateUserFactory.create().execute(id, input, actingUserId(jwt));
  }

  @Override
  @PreAuthorize("hasRole('Administrator')")
  public ResponseEntity<Void> changeStatus(Integer id, ChangeUserStatusInput input, Jwt jwt) {
    changeUserStatusFactory.create().execute(id, input.active(), actingUserId(jwt));
    return ResponseEntity.noContent().build();
  }

  @Override
  @PreAuthorize("hasRole('Administrator')")
  public ReadUserOutput uploadPhoto(Integer id, MultipartFile file) {
    try {
      return userPhotoFactory.create().upload(id, file.getBytes());
    } catch (IOException e) {
      throw new InvalidPhotoException("Não foi possível ler o arquivo enviado.");
    }
  }

  @Override
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<byte[]> getPhoto(Integer id) {
    byte[] content = userPhotoFactory.create().read(id);
    return ResponseEntity.ok().contentType(MediaType.IMAGE_JPEG).body(content);
  }

  @Override
  @PreAuthorize("hasRole('Administrator')")
  public ResponseEntity<Void> removePhoto(Integer id) {
    userPhotoFactory.create().remove(id);
    return ResponseEntity.noContent().build();
  }

  private static Integer actingUserId(Jwt jwt) {
    return Integer.valueOf(jwt.getSubject());
  }
}
