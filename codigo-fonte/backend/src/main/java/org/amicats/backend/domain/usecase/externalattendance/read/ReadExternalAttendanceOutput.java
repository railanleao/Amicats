package org.amicats.backend.domain.usecase.externalattendance.read;

import java.time.LocalDate;
import java.time.LocalDateTime;
import org.amicats.backend.domain.entity.ExternalAttendance;

public record ReadExternalAttendanceOutput(
    Integer id,
    Integer catId,
    String partnerClinic,
    String veterinarian,
    String crmv,
    LocalDate attendanceDate,
    String diagnosis,
    String attachedFile,
    String attachmentContentType,
    LocalDateTime createdAt) {

  public static ReadExternalAttendanceOutput from(ExternalAttendance attendance) {
    return new ReadExternalAttendanceOutput(
        attendance.getId(),
        attendance.getCat().getId(),
        attendance.getPartnerClinic(),
        attendance.getVeterinarian(),
        attendance.getCrmv(),
        attendance.getAttendanceDate(),
        attendance.getDiagnosis(),
        attendance.getAttachedFile(),
        attendance.getAttachmentContentType(),
        attendance.getCreatedAt());
  }
}
