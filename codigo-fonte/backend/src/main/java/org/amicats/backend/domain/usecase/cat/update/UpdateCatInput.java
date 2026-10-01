package org.amicats.backend.domain.usecase.cat.update;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import org.amicats.backend.domain.enums.GeneralStatus;
import org.amicats.backend.domain.enums.Sex;

public record UpdateCatInput(
    @NotBlank @Size(max = 100) String name,
    Integer roomId,
    Sex sex,
    LocalDate estimatedBirthDate,
    @Size(max = 100) String coat,
    BigDecimal weightKg,
    String characteristics,
    GeneralStatus generalStatus,
    @Size(max = 50) String microchip,
    LocalDate rescueDate,
    String foundConditions,
    @Size(max = 150) String sponsorName,
    @Size(max = 20) String sponsorPhone,
    String sponsorFunding) {}
