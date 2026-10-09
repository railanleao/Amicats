package org.amicats.backend.domain.usecase.common;

import java.time.Clock;
import java.time.LocalDate;
import java.time.ZoneId;

public final class BusinessCalendar {

  private static final ZoneId ZONE = ZoneId.of("America/Campo_Grande");

  private BusinessCalendar() {}

  public static LocalDate today(Clock clock) {
    return LocalDate.now(clock.withZone(ZONE));
  }
}
