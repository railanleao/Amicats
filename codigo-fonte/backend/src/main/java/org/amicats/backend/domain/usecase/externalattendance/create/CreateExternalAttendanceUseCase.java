package org.amicats.backend.domain.usecase.externalattendance.create;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.LocalDateTime;
import java.time.ZoneId;
import lombok.Builder;
import org.amicats.backend.domain.entity.Cat;
import org.amicats.backend.domain.entity.ExternalAttendance;
import org.amicats.backend.domain.interfaces.dataprovider.cat.CatDataProvider;
import org.amicats.backend.domain.interfaces.dataprovider.externalattendance.ExternalAttendanceDataProvider;
import org.amicats.backend.domain.usecase.externalattendance.read.ReadExternalAttendanceOutput;
import org.amicats.backend.exception.InvalidRequestException;
import org.amicats.backend.exception.ResourceNotFoundException;
import org.springframework.http.MediaType;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Builder
public class CreateExternalAttendanceUseCase {

  private static final long MAX_FILE_SIZE = 5L * 1024 * 1024;
  private static final ZoneId BRAZIL_ZONE = ZoneId.of("America/Sao_Paulo");

  private CatDataProvider catDataProvider;
  private ExternalAttendanceDataProvider externalAttendanceDataProvider;
  @Builder.Default private Clock clock = Clock.system(BRAZIL_ZONE);

  @Transactional
  public ReadExternalAttendanceOutput execute(
      Integer catId, CreateExternalAttendanceInput input, MultipartFile file) {
    Cat cat =
        catDataProvider
            .findById(catId)
            .orElseThrow(() -> new ResourceNotFoundException("Gato não encontrado."));

    validateFile(file);

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
              LocalDateTime.now(clock));

      return ReadExternalAttendanceOutput.from(externalAttendanceDataProvider.save(attendance));
    } catch (IOException exception) {
      throw new InvalidRequestException("Não foi possível ler o anexo.");
    }
  }

  private void validateFile(MultipartFile file) {
    if (file == null || file.isEmpty() || file.getSize() > MAX_FILE_SIZE) {
      throw new InvalidRequestException("O anexo é obrigatório e deve ter até 5 MB.");
    }
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
    String filename = originalFilename == null ? "anexo" : originalFilename.replace('\\', '/');
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
