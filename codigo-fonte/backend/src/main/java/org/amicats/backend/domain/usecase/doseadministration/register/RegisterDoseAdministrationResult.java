package org.amicats.backend.domain.usecase.doseadministration.register;

import org.amicats.backend.domain.usecase.doseadministration.read.ReadDoseAdministrationOutput;

public record RegisterDoseAdministrationResult(ReadDoseAdministrationOutput dose, boolean created) {}