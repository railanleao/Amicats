package org.amicats.backend.controller.cat;

import java.io.IOException;
import lombok.RequiredArgsConstructor;
import org.amicats.backend.application.factory.cat.CatPhotoFactory;
import org.amicats.backend.application.factory.cat.CreateCatFactory;
import org.amicats.backend.application.factory.cat.ReadCatFactory;
import org.amicats.backend.application.factory.cat.UpdateCatFactory;
import org.amicats.backend.domain.enums.GeneralStatus;
import org.amicats.backend.domain.usecase.cat.create.CreateCatInput;
import org.amicats.backend.domain.usecase.cat.read.CatSearchCriteria;
import org.amicats.backend.domain.usecase.cat.read.ReadCatOutput;
import org.amicats.backend.domain.usecase.cat.update.UpdateCatInput;
import org.amicats.backend.domain.usecase.common.PagedResult;
import org.amicats.backend.exception.InvalidPhotoException;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
public class CatControllerImpl implements CatController {

  private final ReadCatFactory readCatFactory;
  private final CreateCatFactory createCatFactory;
  private final UpdateCatFactory updateCatFactory;
  private final CatPhotoFactory catPhotoFactory;

  @Override
  @PreAuthorize("isAuthenticated()")
  public PagedResult<ReadCatOutput> list(
      String search, Integer roomId, GeneralStatus generalStatus, int page, int size) {
    CatSearchCriteria criteria = new CatSearchCriteria(search, roomId, generalStatus, page, size);
    return readCatFactory.create().search(criteria);
  }

  @Override
  @PreAuthorize("isAuthenticated()")
  public ReadCatOutput findById(Integer id) {
    return readCatFactory.create().findById(id);
  }

  // RF-005 / UC-06: cadastro do gato é de Administrador e Médico-Veterinário.
  @Override
  @PreAuthorize("hasAnyRole('Administrator', 'Veterinarian')")
  public ReadCatOutput create(CreateCatInput input, Jwt jwt) {
    return createCatFactory.create().execute(input, Integer.valueOf(jwt.getSubject()));
  }

  // Same role restriction as create (RF-005 / UC-06): editing a cat's registration is also
  // Administrator and Médico-Veterinário.
  @Override
  @PreAuthorize("hasAnyRole('Administrator', 'Veterinarian')")
  public ReadCatOutput update(Integer id, UpdateCatInput input) {
    return updateCatFactory.create().execute(id, input);
  }

  @Override
  @PreAuthorize("hasRole('Administrator')")
  public ReadCatOutput uploadPhoto(Integer id, MultipartFile file) {
    try {
      return catPhotoFactory.create().upload(id, file.getBytes());
    } catch (IOException e) {
      throw new InvalidPhotoException("Não foi possível ler o arquivo enviado.");
    }
  }

  @Override
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<byte[]> getPhoto(Integer id) {
    byte[] content = catPhotoFactory.create().read(id);
    return ResponseEntity.ok().contentType(MediaType.IMAGE_JPEG).body(content);
  }

  @Override
  @PreAuthorize("hasRole('Administrator')")
  public ResponseEntity<Void> removePhoto(Integer id) {
    catPhotoFactory.create().remove(id);
    return ResponseEntity.noContent().build();
  }
}
