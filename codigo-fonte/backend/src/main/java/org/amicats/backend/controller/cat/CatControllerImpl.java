package org.amicats.backend.controller.cat;

import java.io.IOException;
import lombok.RequiredArgsConstructor;
import org.amicats.backend.application.factory.cat.CatPhotoFactory;
import org.amicats.backend.application.factory.cat.CreateCatFactory;
import org.amicats.backend.application.factory.cat.ReadCatFactory;
import org.amicats.backend.domain.usecase.cat.create.CreateCatInput;
import org.amicats.backend.domain.usecase.cat.photo.ReadCatPhotoOutput;
import org.amicats.backend.domain.usecase.cat.read.ReadCatOutput;
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

  private final CreateCatFactory createCatFactory;
  private final ReadCatFactory readCatFactory;
  private final CatPhotoFactory catPhotoFactory;

  // RF-005 / UC-06: cadastro do gato é de Administrador e Médico-Veterinário.
  @Override
  @PreAuthorize("hasAnyRole('Administrator', 'Veterinarian')")
  public ReadCatOutput create(CreateCatInput input, Jwt jwt) {
    return createCatFactory.create().execute(input, Integer.valueOf(jwt.getSubject()));
  }

  @Override
  @PreAuthorize("isAuthenticated()")
  public ReadCatOutput findById(Integer id) {
    return readCatFactory.create().findById(id);
  }

  // RF-005 / UC-07: fotografia pode ser registrada por Administrador, Médico-Veterinário ou
  // Auxiliar.
  @Override
  @PreAuthorize("hasAnyRole('Administrator', 'Veterinarian', 'Assistant')")
  public ReadCatPhotoOutput uploadPhoto(Integer id, MultipartFile file) {
    try {
      return catPhotoFactory.create().upload(id, file.getBytes());
    } catch (IOException e) {
      throw new InvalidPhotoException("Não foi possível ler o arquivo enviado.");
    }
  }

  @Override
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<byte[]> getPhoto(Integer id, Integer photoId) {
    byte[] content = catPhotoFactory.create().read(id, photoId);
    return ResponseEntity.ok().contentType(MediaType.IMAGE_JPEG).body(content);
  }
}
