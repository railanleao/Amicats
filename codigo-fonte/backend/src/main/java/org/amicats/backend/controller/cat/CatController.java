package org.amicats.backend.controller.cat;

import jakarta.validation.Valid;
import org.amicats.backend.domain.usecase.cat.create.CreateCatInput;
import org.amicats.backend.domain.usecase.cat.photo.ReadCatPhotoOutput;
import org.amicats.backend.domain.usecase.cat.read.ReadCatOutput;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RequestMapping("/cats")
public interface CatController {

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  ReadCatOutput create(@Valid @RequestBody CreateCatInput input, @AuthenticationPrincipal Jwt jwt);

  @GetMapping("/{id}")
  ReadCatOutput findById(@PathVariable Integer id);

  @PostMapping(path = "/{id}/photos", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  @ResponseStatus(HttpStatus.CREATED)
  ReadCatPhotoOutput uploadPhoto(@PathVariable Integer id, @RequestPart("file") MultipartFile file);

  @GetMapping("/{id}/photos/{photoId}")
  ResponseEntity<byte[]> getPhoto(@PathVariable Integer id, @PathVariable Integer photoId);
}
