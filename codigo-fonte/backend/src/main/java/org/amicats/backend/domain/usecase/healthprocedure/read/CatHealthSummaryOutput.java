package org.amicats.backend.domain.usecase.healthprocedure.read;

import java.time.LocalDate;
import org.amicats.backend.domain.enums.NeuteringStatus;

public record CatHealthSummaryOutput(
    Integer catId,
    NeuteringStatus neuteringStatus,
    LocalDate neuteringDate,
    ReadHealthProcedureOutput lastVaccine,
    ReadHealthProcedureOutput lastDeworming,
    ReadHealthProcedureOutput nextScheduled) {}
