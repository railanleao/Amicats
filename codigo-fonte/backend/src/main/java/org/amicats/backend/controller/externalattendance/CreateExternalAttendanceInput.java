package org.amicats.backend.controller.externalattendance;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record CreateExternalAttendanceInput(
    @NotBlank @Size(max = 150) String partnerClinic,
    @NotBlank @Size(max = 150) String veterinarian,
    @NotBlank @Size(max = 30) String crmv,
    @NotNull @PastOrPresent LocalDate attendanceDate,
    @NotBlank @Size(max = 2000) String diagnosis) {}
