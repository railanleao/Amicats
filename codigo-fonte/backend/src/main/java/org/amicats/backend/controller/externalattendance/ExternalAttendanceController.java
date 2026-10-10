package org.amicats.backend.controller.externalattendance;

import jakarta.validation.Valid;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Objects;
import org.amicats.backend.domain.entity.Cat;
import org.amicats.backend.domain.entity.ExternalAttendance;
import org.amicats.backend.exception.InvalidRequestException;
import org.amicats.backend.exception.ResourceNotFoundException;
import org.amicats.backend.repository.cat.CatRepository;
import org.amicats.backend.repository.externalattendance.ExternalAttendanceRepository;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping
public class ExternalAttendanceController {

  private static final long MAX_FILE_SIZE = 5L * 1024 * 1024;
  private static final ZoneId BRAZIL_ZONE = ZoneId.of("America/Sao_Paulo");

  private final ExternalAttendanceRepository attendanceRepository;
  private final CatRepository catRepository;

  public ExternalAttendanceController(
      ExternalAttendanceRepository attendanceRepository, CatRepository catRepository) {
    this.attendanceRepository = attendanceRepository;
    this.catRepository = catRepository;
  }

  @PostMapping(
      path = "/cats/{catId}/external-attendances",
      consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  @ResponseStatus(HttpStatus.CREATED)
  @PreAuthorize("hasRole('Administrator')")
  @Transactional
  public ExternalAttendanceOutput create(
      @PathVariable Integer catId,
      @Valid @RequestPart("data") CreateExternalAttendanceInput input,
      @RequestPart("file") MultipartFile file) {

    Cat cat =
        catRepository
            .findById(catId)
            .orElseThrow(() -> new ResourceNotFoundException("Gato não encontrado."));

    if (file == null || file.isEmpty() || file.getSize() > MAX_FILE_SIZE) {
      throw new InvalidRequestException("O anexo é obrigatório e deve ter até 5 MB.");
    }

    try {
      byte[] attachmentData = file.getBytes();

      String contentType = detectContentType(attachmentData);
      String filename = normalizeFilename(file.getOriginalFilename());

      ExternalAttendance attendance =
          new ExternalAttendance(
              cat,
              input.partnerClinic().trim(),
              input.veterinarian().trim(),
              input.crmv().trim(),
              input.attendanceDate(),
              input.diagnosis().trim(),
              filename,
              contentType,
              attachmentData,
              LocalDateTime.now(BRAZIL_ZONE));

      return ExternalAttendanceOutput.from(attendanceRepository.save(attendance));

    } catch (IOException exception) {
      throw new InvalidRequestException("Não foi possível ler o anexo.");
    }
  }

  @GetMapping("/cats/{catId}/external-attendances")
  // All authenticated profiles may read the clinical record.
  @PreAuthorize("isAuthenticated()")
  @Transactional(readOnly = true)
  public List<ExternalAttendanceOutput> listByCat(@PathVariable Integer catId) {

    if (!catRepository.existsById(catId)) {
      throw new ResourceNotFoundException("Gato não encontrado.");
    }

    return attendanceRepository.findSummariesByCatId(catId);
  }

  @GetMapping("/external-attendances/{id}/attachment")
  // Attachments use the same read policy as listing.
  @PreAuthorize("isAuthenticated()")
  @Transactional(readOnly = true)
  public ResponseEntity<byte[]> attachment(@PathVariable Integer id) {

    ExternalAttendance attendance =
        attendanceRepository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Atendimento não encontrado."));

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

  private String detectContentType(byte[] bytes) {

    if (startsWith(bytes, "%PDF-".getBytes(StandardCharsets.US_ASCII))) {
      return MediaType.APPLICATION_PDF_VALUE;
    }

    if (startsWith(bytes, new byte[] {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF})) {
      return MediaType.IMAGE_JPEG_VALUE;
    }

    if (startsWith(bytes, new byte[] {(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A})) {
      return MediaType.IMAGE_PNG_VALUE;
    }

    throw new InvalidRequestException("O anexo deve conter um PDF, JPG ou PNG válido.");
  }

  private boolean startsWith(byte[] value, byte[] prefix) {

    if (value.length < prefix.length) {
      return false;
    }

    for (int index = 0; index < prefix.length; index++) {
      if (value[index] != prefix[index]) {
        return false;
      }
    }

    return true;
  }

  private String normalizeFilename(String originalFilename) {

    String filename = Objects.toString(originalFilename, "anexo").replace('\\', '/');

    filename = filename.substring(filename.lastIndexOf('/') + 1).trim();

    filename = filename.replaceAll("[\\p{Cntrl}]", "_");

    if (filename.isBlank() || filename.equals(".") || filename.equals("..")) {
      filename = "anexo";
    }

    if (filename.length() > 255) {
      filename = filename.substring(0, 255);
    }

    return filename;
  }
}
