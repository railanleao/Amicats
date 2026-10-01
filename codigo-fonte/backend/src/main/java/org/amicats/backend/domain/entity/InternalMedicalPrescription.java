package org.amicats.backend.domain.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.amicats.backend.domain.enums.MedicalPrescriptionStatus;

@Entity
@Table(name = "internal_medical_prescriptions")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class InternalMedicalPrescription {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id_internal_medical_prescription")
  private Integer id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "id_cat", nullable = false)
  private Cat cat;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "id_user_vet", nullable = false)
  private User veterinarian;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private MedicalPrescriptionStatus status;

  @Column(nullable = false, length = 200)
  private String title;

  @Column(columnDefinition = "text")
  private String notes;

  @Column(name = "created_at", nullable = false)
  private LocalDateTime createdAt;

  public InternalMedicalPrescription(
      Cat cat,
      User veterinarian,
      String title,
      String notes,
      boolean withMedication,
      LocalDateTime createdAt) {
    this.cat = cat;
    this.veterinarian = veterinarian;
    this.status =
        withMedication
            ? MedicalPrescriptionStatus.InTreatment
            : MedicalPrescriptionStatus.Completed;
    this.title = title;
    this.notes = notes;
    this.createdAt = createdAt;
  }
}
