package org.amicats.backend.controller.cat;

import org.amicats.backend.domain.enums.GeneralStatus;
import org.amicats.backend.domain.usecase.cat.read.ReadCatOutput;
import org.amicats.backend.domain.usecase.common.PagedResult;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RequestMapping("/cats")
public interface CatController {

  @GetMapping
  PagedResult<ReadCatOutput> list(
      @RequestParam(required = false) String search,
      @RequestParam(required = false) Integer roomId,
      @RequestParam(required = false) GeneralStatus generalStatus,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size);

  @GetMapping("/{id}")
  ReadCatOutput findById(@PathVariable Integer id);

  @PutMapping(path = "/{id}/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  ReadCatOutput uploadPhoto(@PathVariable Integer id, @RequestPart("file") MultipartFile file);

  @GetMapping("/{id}/photo")
  ResponseEntity<byte[]> getPhoto(@PathVariable Integer id);

  @DeleteMapping("/{id}/photo")
  ResponseEntity<Void> removePhoto(@PathVariable Integer id);
}
