package org.amicats.backend.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
import org.amicats.backend.domain.enums.CatClinicalStatus;
import org.amicats.backend.domain.enums.CatSex;
import org.amicats.backend.domain.enums.HealthTestResult;
import org.amicats.backend.domain.enums.NeuteredStatus;

@Entity
@Table(name = "cats")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Cat {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id_cat")
  private Integer id;

  @Column(nullable = false, length = 100)
  private String name;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "room_id")
  private Room room;

  @Enumerated(EnumType.STRING)
  @Column(length = 10)
  private CatSex sex;

  @Column(name = "estimated_age", length = 50)
  private String estimatedAge;

  @Column(length = 100)
  private String coat;

  @Column(length = 50)
  private String microchip;

  @Enumerated(EnumType.STRING)
  @Column(name = "fiv_status", length = 20)
  private HealthTestResult fivStatus;

  @Enumerated(EnumType.STRING)
  @Column(name = "felv_status", length = 20)
  private HealthTestResult felvStatus;

  @Enumerated(EnumType.STRING)
  @Column(name = "pif_status", length = 20)
  private HealthTestResult pifStatus;

  @Enumerated(EnumType.STRING)
  @Column(name = "neutered_status", length = 20)
  private NeuteredStatus neuteredStatus;

  @Enumerated(EnumType.STRING)
  @Column(name = "clinical_status", nullable = false, length = 30)
  private CatClinicalStatus clinicalStatus;

  @Column(name = "health_notes", columnDefinition = "text")
  private String healthNotes;

  @Column(name = "rescue_date")
  private LocalDate rescueDate;

  @Column(name = "rescue_location", length = 200)
  private String rescueLocation;

  @Column(name = "sponsor_name", length = 150)
  private String sponsorName;

  @Column(name = "sponsor_phone", length = 20)
  private String sponsorPhone;

  @Column(name = "sponsor_coverage", columnDefinition = "text")
  private String sponsorCoverage;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "created_by_user_id")
  private User createdBy;

  @Column(name = "created_at", nullable = false)
  private LocalDateTime createdAt;

  public Cat(
      String name,
      Room room,
      CatSex sex,
      String estimatedAge,
      String coat,
      String microchip,
      HealthTestResult fivStatus,
      HealthTestResult felvStatus,
      HealthTestResult pifStatus,
      NeuteredStatus neuteredStatus,
      CatClinicalStatus clinicalStatus,
      String healthNotes,
      LocalDate rescueDate,
      String rescueLocation,
      String sponsorName,
      String sponsorPhone,
      String sponsorCoverage,
      User createdBy) {
    this.name = name;
    this.room = room;
    this.sex = sex;
    this.estimatedAge = estimatedAge;
    this.coat = coat;
    this.microchip = microchip;
    this.fivStatus = fivStatus;
    this.felvStatus = felvStatus;
    this.pifStatus = pifStatus;
    this.neuteredStatus = neuteredStatus;
    // "Em triagem" is the natural default for a cat that was just registered and hasn't been
    // placed in a room or examined yet — the Paper design doesn't mark this field as required, so
    // this keeps the form quick to fill (RNF-007) while still satisfying the NOT NULL column.
    this.clinicalStatus = clinicalStatus != null ? clinicalStatus : CatClinicalStatus.InTriage;
    this.healthNotes = healthNotes;
    this.rescueDate = rescueDate;
    this.rescueLocation = rescueLocation;
    this.sponsorName = sponsorName;
    this.sponsorPhone = sponsorPhone;
    this.sponsorCoverage = sponsorCoverage;
    this.createdBy = createdBy;
    this.createdAt = LocalDateTime.now();
  }
}
