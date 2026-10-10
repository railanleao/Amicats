package org.amicats.backend.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "external_attendances")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ExternalAttendance {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id_external_attendance")
  private Integer id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "id_cat", nullable = false)
  private Cat cat;

  @Column(name = "partner_clinic", nullable = false, length = 150)
  private String partnerClinic;

  @Column(nullable = false, length = 150)
  private String veterinarian;

  @Column(nullable = false, length = 30)
  private String crmv;

  @Column(name = "attendance_date", nullable = false)
  private LocalDate attendanceDate;

  @Column(nullable = false, columnDefinition = "text")
  private String diagnosis;

  @Column(name = "attached_file", nullable = false, length = 255)
  private String attachedFile;

  @Column(name = "attachment_content_type", nullable = false, length = 100)
  private String attachmentContentType;

  @Column(name = "attachment_data", nullable = false, columnDefinition = "bytea")
  private byte[] attachmentData;

  @Column(name = "created_at", nullable = false)
  private LocalDateTime createdAt;

  public ExternalAttendance(
      Cat cat,
      String partnerClinic,
      String veterinarian,
      String crmv,
      LocalDate attendanceDate,
      String diagnosis,
      String attachedFile,
      String attachmentContentType,
      byte[] attachmentData,
      LocalDateTime createdAt) {
    this.cat = cat;
    this.partnerClinic = partnerClinic;
    this.veterinarian = veterinarian;
    this.crmv = crmv;
    this.attendanceDate = attendanceDate;
    this.diagnosis = diagnosis;
    this.attachedFile = attachedFile;
    this.attachmentContentType = attachmentContentType;
    this.attachmentData = attachmentData;
    this.createdAt = createdAt;
  }
}
