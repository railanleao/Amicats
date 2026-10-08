package org.amicats.backend.controller.externalattendance;

import jakarta.validation.Valid;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import org.amicats.backend.domain.entity.Cat;
import org.amicats.backend.domain.entity.ExternalAttendance;
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
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping
public class ExternalAttendanceController {

  private static final long MAX_FILE_SIZE = 5L * 1024 * 1024;
  private static final List<String> ALLOWED_TYPES =
      List.of("application/pdf", "image/jpeg", "image/png");

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
  @PreAuthorize("isAuthenticated()")
  @Transactional
  public ExternalAttendanceOutput create(
      @PathVariable Integer catId,
      @Valid @RequestPart("data") CreateExternalAttendanceInput input,
      @RequestPart("file") MultipartFile file) {
    Cat cat =
        catRepository
            .findById(catId)
            .orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Gato não encontrado."));

    if (input.attendanceDate() == null
        || input.attendanceDate().isAfter(java.time.LocalDate.now())) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST, "Informe uma data de atendimento válida, que não seja futura.");
    }
    if (file == null || file.isEmpty() || file.getSize() > MAX_FILE_SIZE) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST, "O anexo é obrigatório e deve ter até 5 MB.");
    }
    String contentType = file.getContentType();
    if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST, "O anexo deve ser PDF, JPG ou PNG.");
    }

    try {
      String filename = file.getOriginalFilename() == null ? "anexo" : file.getOriginalFilename();
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
              file.getBytes(),
              LocalDateTime.now());
      return ExternalAttendanceOutput.from(attendanceRepository.save(attendance));
    } catch (IOException exception) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Não foi possível ler o anexo.");
    }
  }

  @GetMapping("/cats/{catId}/external-attendances")
  @PreAuthorize("isAuthenticated()")
  @Transactional(readOnly = true)
  public List<ExternalAttendanceOutput> listByCat(@PathVariable Integer catId) {
    if (!catRepository.existsById(catId)) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Gato não encontrado.");
    }
    return attendanceRepository
        .findAllByCat_IdOrderByAttendanceDateDescCreatedAtDesc(catId)
        .stream()
        .map(ExternalAttendanceOutput::from)
        .toList();
  }

  @GetMapping("/external-attendances/{id}/attachment")
  @PreAuthorize("isAuthenticated()")
  @Transactional(readOnly = true)
  public ResponseEntity<byte[]> attachment(@PathVariable Integer id) {
    ExternalAttendance attendance =
        attendanceRepository
            .findById(id)
            .orElseThrow(
                () ->
                    new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Atendimento não encontrado."));
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
