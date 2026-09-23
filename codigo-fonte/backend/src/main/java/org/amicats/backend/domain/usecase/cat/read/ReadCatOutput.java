package org.amicats.backend.domain.usecase.cat.read;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import org.amicats.backend.domain.entity.Cat;
import org.amicats.backend.domain.enums.CatClinicalStatus;
import org.amicats.backend.domain.enums.CatSex;
import org.amicats.backend.domain.enums.HealthTestResult;
import org.amicats.backend.domain.enums.NeuteredStatus;

public record ReadCatOutput(
    Integer id,
    String name,
    Integer roomId,
    CatSex sex,
    String estimatedAge,
    String coat,
    String microchip,
    HealthTestResult fiv,
    HealthTestResult felv,
    HealthTestResult pif,
    NeuteredStatus neutered,
    CatClinicalStatus clinicalStatus,
    String healthNotes,
    LocalDate rescueDate,
    String rescueLocation,
    String sponsorName,
    String sponsorPhone,
    String sponsorCoverage,
    LocalDateTime createdAt,
    List<String> photoUrls) {

  public static ReadCatOutput from(Cat cat, List<String> photoUrls) {
    return new ReadCatOutput(
        cat.getId(),
        cat.getName(),
        cat.getRoom() != null ? cat.getRoom().getId() : null,
        cat.getSex(),
        cat.getEstimatedAge(),
        cat.getCoat(),
        cat.getMicrochip(),
        cat.getFivStatus(),
        cat.getFelvStatus(),
        cat.getPifStatus(),
        cat.getNeuteredStatus(),
        cat.getClinicalStatus(),
        cat.getHealthNotes(),
        cat.getRescueDate(),
        cat.getRescueLocation(),
        cat.getSponsorName(),
        cat.getSponsorPhone(),
        cat.getSponsorCoverage(),
        cat.getCreatedAt(),
        photoUrls);
  }
}
