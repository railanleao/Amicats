package org.amicats.backend.domain.usecase.cat.create;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import org.amicats.backend.domain.enums.CatClinicalStatus;
import org.amicats.backend.domain.enums.CatSex;
import org.amicats.backend.domain.enums.HealthTestResult;
import org.amicats.backend.domain.enums.NeuteredStatus;

public record CreateCatInput(
    @NotBlank @Size(max = 100) String name,
    Integer roomId,
    CatSex sex,
    @Size(max = 50) String estimatedAge,
    @Size(max = 100) String coat,
    @Size(max = 50) String microchip,
    HealthTestResult fiv,
    HealthTestResult felv,
    HealthTestResult pif,
    NeuteredStatus neutered,
    CatClinicalStatus clinicalStatus,
    String healthNotes,
    LocalDate rescueDate,
    @Size(max = 200) String rescueLocation,
    @Size(max = 150) String sponsorName,
    @Size(max = 20) String sponsorPhone,
    String sponsorCoverage) {}
