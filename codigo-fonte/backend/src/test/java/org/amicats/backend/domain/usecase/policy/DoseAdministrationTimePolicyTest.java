package org.amicats.backend.domain.usecase.policy;

import static org.assertj.core.api.Assertions.*;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import org.junit.jupiter.api.Test;

class DoseAdministrationTimePolicyTest {
  @Test
  void utcNowDoesNotDependOnTheClockZone() {
    Instant instant = Instant.parse("2026-10-08T14:00:00Z");
    var expected = LocalDateTime.parse("2026-10-08T14:00:00");
    assertThat(
            DoseAdministrationTimePolicy.nowUtc(
                Clock.fixed(instant, ZoneId.of("Pacific/Honolulu"))))
        .isEqualTo(expected);
    assertThat(DoseAdministrationTimePolicy.nowUtc(Clock.fixed(instant, ZoneOffset.UTC)))
        .isEqualTo(expected);
  }

  @Test
  void differentClinicalZonesHaveTheirOwnMidnight() {
    var utc = LocalDateTime.parse("2026-10-09T03:30:00");
    var day = LocalDate.of(2026, 10, 8);
    assertThat(
            DoseAdministrationTimePolicy.isWithinTreatmentPeriod(
                utc, day, day, ZoneId.of("America/Sao_Paulo")))
        .isFalse();
    assertThat(
            DoseAdministrationTimePolicy.isWithinTreatmentPeriod(
                utc, day, day, ZoneId.of("America/Campo_Grande")))
        .isTrue();
  }
}
