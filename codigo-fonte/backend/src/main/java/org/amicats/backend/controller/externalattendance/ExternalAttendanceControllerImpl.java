package org.amicats.backend.controller.externalattendance;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.amicats.backend.application.factory.externalattendance.CreateExternalAttendanceFactory;
import org.amicats.backend.application.factory.externalattendance.ReadExternalAttendanceFactory;
import org.amicats.backend.domain.entity.ExternalAttendance;
import org.amicats.backend.domain.usecase.externalattendance.create.CreateExternalAttendanceInput;
import org.amicats.backend.domain.usecase.externalattendance.read.ReadExternalAttendanceOutput;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
public class ExternalAttendanceControllerImpl implements ExternalAttendanceController {

  private final CreateExternalAttendanceFactory createExternalAttendanceFactory;
  private final ReadExternalAttendanceFactory readExternalAttendanceFactory;

  @Override
  @PreAuthorize("hasRole('Administrator')")
  public ReadExternalAttendanceOutput create(
      Integer catId, CreateExternalAttendanceInput input, MultipartFile file) {
    return createExternalAttendanceFactory.create().execute(catId, input, file);
  }

  @Override
  @PreAuthorize("isAuthenticated()")
  public List<ReadExternalAttendanceOutput> listByCat(Integer catId) {
    return readExternalAttendanceFactory.create().findByCat(catId);
  }

  @Override
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<byte[]> attachment(Integer id) {
    ExternalAttendance attendance = readExternalAttendanceFactory.create().findAttachment(id);

    return ResponseEntity.ok()
        .contentType(MediaType.parseMediaType(attendance.getAttachmentContentType()))
        .header(
            HttpHeaders.CONTENT_DISPOSITION,
            ContentDisposition.attachment()
                .filename(attendance.getAttachedFile())
                .build()
                .toString())
        .body(attendance.getAttachmentData());
  }
}
