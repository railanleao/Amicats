package org.amicats.backend.controller.externalattendance;

import jakarta.validation.Valid;
import java.util.List;
import org.amicats.backend.domain.usecase.externalattendance.create.CreateExternalAttendanceInput;
import org.amicats.backend.domain.usecase.externalattendance.read.ReadExternalAttendanceOutput;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.multipart.MultipartFile;

public interface ExternalAttendanceController {

  @PostMapping(path = "/cats/{catId}/external-attendances", consumes = "multipart/form-data")
  @ResponseStatus(HttpStatus.CREATED)
  ReadExternalAttendanceOutput create(
      @PathVariable Integer catId,
      @Valid @RequestPart("data") CreateExternalAttendanceInput input,
      @RequestPart("file") MultipartFile file);

  @GetMapping("/cats/{catId}/external-attendances")
  List<ReadExternalAttendanceOutput> listByCat(@PathVariable Integer catId);

  @GetMapping("/external-attendances/{id}/attachment")
  ResponseEntity<byte[]> attachment(@PathVariable Integer id);
}
