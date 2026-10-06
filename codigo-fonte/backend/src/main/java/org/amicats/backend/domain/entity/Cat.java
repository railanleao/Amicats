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
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.amicats.backend.domain.enums.AgeGroup;
import org.amicats.backend.domain.enums.GeneralStatus;
import org.amicats.backend.domain.enums.HealthStatus;
import org.amicats.backend.domain.enums.NeuteringStatus;
import org.amicats.backend.domain.enums.PifResult;
import org.amicats.backend.domain.enums.Severity;
import org.amicats.backend.domain.enums.Sex;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "cats")
@Getter
@Setter(onMethod_ = @Deprecated)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Cat {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id_cat")
  private Integer id;

  @Column(name = "updated_at", insertable = false, updatable = false)
  private LocalDateTime updatedAt;

  @Column(nullable = false, length = 100)
  private String name;

  @Column(name = "photo_url", length = 500)
  private String photoUrl;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "id_room")
  private Room room;

  @Enumerated(EnumType.STRING)
  @JdbcTypeCode(SqlTypes.NAMED_ENUM)
  private Sex sex;

  @Column(name = "estimated_birth_date")
  private LocalDate estimatedBirthDate;

  @Enumerated(EnumType.STRING)
  @JdbcTypeCode(SqlTypes.NAMED_ENUM)
  @Column(name = "age_group")
  private AgeGroup ageGroup;

  @Column(length = 100)
  private String coat;

  @Column(name = "weight_kg", precision = 5, scale = 2)
  private BigDecimal weightKg;

  @Column(columnDefinition = "text")
  private String characteristics;

  @Enumerated(EnumType.STRING)
  @JdbcTypeCode(SqlTypes.NAMED_ENUM)
  @Column(name = "general_status", nullable = false)
  private GeneralStatus generalStatus;

  @Enumerated(EnumType.STRING)
  @JdbcTypeCode(SqlTypes.NAMED_ENUM)
  @Column(name = "health_status", nullable = false)
  private HealthStatus healthStatus;

  @Column(name = "fiv_felv_exam_date")
  private LocalDate fivFelvExamDate;

  @Enumerated(EnumType.STRING)
  @JdbcTypeCode(SqlTypes.NAMED_ENUM)
  @Column(name = "pif_result", nullable = false)
  private PifResult pifResult;

  @Column(name = "pif_exam_date")
  private LocalDate pifExamDate;

  @Enumerated(EnumType.STRING)
  @JdbcTypeCode(SqlTypes.NAMED_ENUM)
  private Severity severity;

  @Enumerated(EnumType.STRING)
  @JdbcTypeCode(SqlTypes.NAMED_ENUM)
  @Column(name = "neutering_status")
  private NeuteringStatus neuteringStatus;

  @Column(name = "neutering_date")
  private LocalDate neuteringDate;

  @Column(length = 50, unique = true)
  private String microchip;

  @Column(name = "rescue_date")
  private LocalDate rescueDate;

  @Column(name = "found_conditions", columnDefinition = "text")
  private String foundConditions;

  @Column(name = "sponsor_name", length = 150)
  private String sponsorName;

  @Column(name = "sponsor_phone", length = 20)
  private String sponsorPhone;

  @Column(name = "sponsor_funding", columnDefinition = "text")
  private String sponsorFunding;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "id_user_creator", nullable = false)
  private User createdBy;

  @Column(name = "created_at", nullable = false)
  private LocalDateTime createdAt;

  public Cat(
      String name,
      Room room,
      Sex sex,
      LocalDate estimatedBirthDate,
      String coat,
      BigDecimal weightKg,
      String characteristics,
      GeneralStatus generalStatus,
      String microchip,
      LocalDate rescueDate,
      String foundConditions,
      String sponsorName,
      String sponsorPhone,
      String sponsorFunding,
      User createdBy) {
    this.name = name;
    this.room = room;
    this.sex = sex;
    this.estimatedBirthDate = estimatedBirthDate;
    this.ageGroup = calculateAgeGroup(estimatedBirthDate);
    this.coat = coat;
    this.weightKg = weightKg;
    this.characteristics = characteristics;
    this.generalStatus = generalStatus;
    this.healthStatus = HealthStatus.NotTested;
    this.pifResult = PifResult.NotTested;
    this.microchip = microchip;
    this.rescueDate = rescueDate;
    this.foundConditions = foundConditions;
    this.sponsorName = sponsorName;
    this.sponsorPhone = sponsorPhone;
    this.sponsorFunding = sponsorFunding;
    this.createdBy = createdBy;
    this.createdAt = LocalDateTime.now();
  }

  private static AgeGroup calculateAgeGroup(LocalDate estimatedBirthDate) {
    if (estimatedBirthDate == null) {
      return null;
    }
    long ageInMonths = ChronoUnit.MONTHS.between(estimatedBirthDate, LocalDate.now());
    if (ageInMonths < 6) {
      return AgeGroup.Kitten;
    }
    if (ageInMonths < 24) {
      return AgeGroup.Young;
    }
    if (ageInMonths < 84) {
      return AgeGroup.Adult;
    }
    return AgeGroup.Senior;
  }

  public void updateBasicInfo(String name, Sex sex, String coat, String characteristics) {
    this.name = name;
    this.sex = sex;
    this.coat = coat;
    this.characteristics = characteristics;
  }

  public void updateRescueInfo(LocalDate rescueDate, String foundConditions) {
    this.rescueDate = rescueDate;
    this.foundConditions = foundConditions;
  }

  public void updateBirthDate(LocalDate estimatedBirthDate) {
    this.estimatedBirthDate = estimatedBirthDate;
    this.ageGroup = calculateAgeGroup(estimatedBirthDate);
  }

  public void assignRoom(Room room) {
    this.room = room;
  }

  public void changeGeneralStatus(GeneralStatus generalStatus) {
    this.generalStatus = generalStatus;
  }

  public void registerFivFelvExam(HealthStatus healthStatus, LocalDate examDate) {
    this.healthStatus = healthStatus;
    this.fivFelvExamDate = examDate;
  }

  public void registerPifExam(PifResult pifResult, LocalDate examDate) {
    this.pifResult = pifResult;
    this.pifExamDate = examDate;
  }

  public void updateSeverity(Severity severity) {
    this.severity = severity;
  }

  public void registerNeutering(NeuteringStatus neuteringStatus, LocalDate neuteringDate) {
    this.neuteringStatus = neuteringStatus;
    this.neuteringDate = neuteringDate;
  }

  public void updateWeight(BigDecimal weightKg) {
    this.weightKg = weightKg;
  }

  public void updateMicrochip(String microchip) {
    this.microchip = microchip;
  }

  public void updateSponsor(String sponsorName, String sponsorPhone, String sponsorFunding) {
    this.sponsorName = sponsorName;
    this.sponsorPhone = sponsorPhone;
    this.sponsorFunding = sponsorFunding;
  }

  public void changeImage(String imageKey) {
    this.photoUrl = imageKey;
  }

  public void removeImage() {
    this.photoUrl = null;
  }
}
