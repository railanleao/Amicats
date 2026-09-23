package org.amicats.backend.domain.usecase.cat.read;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import org.amicats.backend.domain.entity.Cat;
import org.amicats.backend.domain.enums.AgeGroup;
import org.amicats.backend.domain.enums.GeneralStatus;
import org.amicats.backend.domain.enums.HealthStatus;
import org.amicats.backend.domain.enums.NeuteringStatus;
import org.amicats.backend.domain.enums.PifResult;
import org.amicats.backend.domain.enums.Severity;
import org.amicats.backend.domain.enums.Sex;

public record ReadCatOutput(
    Integer id,
    String name,
    String photoUrl,
    Integer roomId,
    String roomTitle,
    Sex sex,
    LocalDate estimatedBirthDate,
    AgeGroup ageGroup,
    String coat,
    BigDecimal weightKg,
    String characteristics,
    GeneralStatus generalStatus,
    HealthStatus healthStatus,
    LocalDate fivFelvExamDate,
    PifResult pifResult,
    LocalDate pifExamDate,
    Severity severity,
    NeuteringStatus neuteringStatus,
    LocalDate neuteringDate,
    String microchip,
    LocalDate rescueDate,
    String foundConditions,
    String sponsorName,
    String sponsorPhone,
    String sponsorFunding,
    LocalDateTime createdAt) {

  public static ReadCatOutput from(Cat cat) {
    return new ReadCatOutput(
        cat.getId(),
        cat.getName(),
        photoPath(cat),
        cat.getRoom() == null ? null : cat.getRoom().getId(),
        cat.getRoom() == null ? null : cat.getRoom().getTitle(),
        cat.getSex(),
        cat.getEstimatedBirthDate(),
        cat.getAgeGroup(),
        cat.getCoat(),
        cat.getWeightKg(),
        cat.getCharacteristics(),
        cat.getGeneralStatus(),
        cat.getHealthStatus(),
        cat.getFivFelvExamDate(),
        cat.getPifResult(),
        cat.getPifExamDate(),
        cat.getSeverity(),
        cat.getNeuteringStatus(),
        cat.getNeuteringDate(),
        cat.getMicrochip(),
        cat.getRescueDate(),
        cat.getFoundConditions(),
        cat.getSponsorName(),
        cat.getSponsorPhone(),
        cat.getSponsorFunding(),
        cat.getCreatedAt());
  }

  private static String photoPath(Cat cat) {
    return cat.getPhotoUrl() == null ? null : "/cats/" + cat.getId() + "/photo";
  }
}
