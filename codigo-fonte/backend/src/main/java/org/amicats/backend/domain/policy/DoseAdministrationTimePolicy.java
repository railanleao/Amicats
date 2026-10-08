package org.amicats.backend.domain.policy;

import java.time.Clock;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;

/** UTC timestamps and clinical calendar dates have different meanings. */
public final class DoseAdministrationTimePolicy {
  public static final Duration MAX_FUTURE_SKEW = Duration.ofMinutes(5);
  public static final ZoneId DEFAULT_CLINICAL_ZONE = ZoneId.of("America/Sao_Paulo");

  private DoseAdministrationTimePolicy() {}

  public static LocalDateTime nowUtc(Clock clock) {
    // Even a test clock with a different zone must produce the same UTC timestamp.
    return LocalDateTime.ofInstant(clock.instant(), ZoneOffset.UTC);
  }

  public static boolean exceedsFutureSkew(LocalDateTime appliedUtc, LocalDateTime recordedUtc) {
    return appliedUtc.isAfter(recordedUtc.plus(MAX_FUTURE_SKEW));
  }

  public static LocalDate clinicalDate(LocalDateTime utc, ZoneId clinicalZone) {
    return utc.atOffset(ZoneOffset.UTC).atZoneSameInstant(clinicalZone).toLocalDate();
  }

  public static boolean isWithinTreatmentPeriod(
      LocalDateTime appliedUtc, LocalDate startDate, LocalDate endDate, ZoneId clinicalZone) {
    LocalDate appliedClinicalDate = clinicalDate(appliedUtc, clinicalZone);
    return !appliedClinicalDate.isBefore(startDate) && !appliedClinicalDate.isAfter(endDate);
  }
}
