package org.amicats.backend.domain.usecase.doseadministration;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.mock;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.UUID;
import org.amicats.backend.domain.entity.Cat;
import org.amicats.backend.domain.entity.DoseAdministration;
import org.amicats.backend.domain.entity.InternalMedicalPrescription;
import org.amicats.backend.domain.entity.PrescribedMedication;
import org.amicats.backend.domain.entity.StockItem;
import org.amicats.backend.domain.entity.User;
import org.amicats.backend.domain.enums.AdministrationRoute;
import org.amicats.backend.domain.enums.DoseRegistrationOrigin;
import org.amicats.backend.exception.DoseAdministrationConflictException;
import org.amicats.backend.exception.InvalidDoseAdministrationException;
import org.junit.jupiter.api.Test;

class DoseAdministrationTimeTest {
  private static final ZoneId CLINICAL_ZONE = ZoneId.of("America/Sao_Paulo");
  private final User user = mock(User.class);
  private final PrescribedMedication medication = medication();

  @Test
  void acceptsFiveMinutesExactlyAndPreservesTheReportedTime() {
    LocalDateTime recorded = LocalDateTime.parse("2026-10-08T14:00:00");
    LocalDateTime applied = recorded.plusMinutes(5);
    DoseAdministration dose = register(applied, recorded);
    assertThat(dose.getAdministeredAt()).isEqualTo(applied);
    assertThat(dose.getRecordedAt()).isEqualTo(recorded);
  }

  @Test
  void rejectsFiveMinutesAndOneMicrosecond() {
    LocalDateTime recorded = LocalDateTime.parse("2026-10-08T14:00:00");
    assertThatThrownBy(() -> register(recorded.plusMinutes(5).plusNanos(1000), recorded))
        .isInstanceOf(InvalidDoseAdministrationException.class)
        .hasMessageContaining("5 minutos");
  }

  @Test
  void firstClinicalDayBeginsAtLocalMidnightNotUtcMidnight() {
    LocalDateTime recorded = LocalDateTime.parse("2026-10-08T14:00:00");
    assertThatThrownBy(() -> register(LocalDateTime.parse("2026-10-08T02:59:59.999999"), recorded))
        .isInstanceOf(InvalidDoseAdministrationException.class);
    assertThat(register(LocalDateTime.parse("2026-10-08T03:00:00"), recorded)).isNotNull();
  }

  @Test
  void lastClinicalDayIncludesTheEveningEvenAfterUtcMidnight() {
    LocalDateTime recorded = LocalDateTime.parse("2026-10-09T04:00:00");
    assertThat(register(LocalDateTime.parse("2026-10-09T02:00:00"), recorded)).isNotNull();
    assertThat(register(LocalDateTime.parse("2026-10-09T02:59:59.999999"), recorded)).isNotNull();
    assertThatThrownBy(() -> register(LocalDateTime.parse("2026-10-09T03:00:00"), recorded))
        .isInstanceOf(InvalidDoseAdministrationException.class);
  }

  @Test
  void toleranceDoesNotExtendTheTreatmentPeriod() {
    assertThatThrownBy(
            () ->
                register(
                    LocalDateTime.parse("2026-10-09T03:01:00"),
                    LocalDateTime.parse("2026-10-09T02:59:00")))
        .isInstanceOf(InvalidDoseAdministrationException.class)
        .hasMessageContaining("período");
  }

  @Test
  void toleranceDoesNotAllowAnApplicationAtOrAfterCancellation() {
    LocalDateTime cancelled = LocalDateTime.parse("2026-10-08T14:00:00");
    medication.cancel(user, "Teste", cancelled, CLINICAL_ZONE);
    assertThatThrownBy(() -> register(cancelled.plusMinutes(1), cancelled))
        .isInstanceOf(DoseAdministrationConflictException.class);
  }

  private DoseAdministration register(LocalDateTime applied, LocalDateTime recorded) {
    return DoseAdministration.register(
        medication,
        user,
        UUID.randomUUID(),
        applied,
        recorded,
        null,
        DoseRegistrationOrigin.OfflineSynced,
        CLINICAL_ZONE);
  }

  private PrescribedMedication medication() {
    LocalDateTime created = LocalDateTime.parse("2026-10-07T12:00:00");
    var prescription =
        new InternalMedicalPrescription(mock(Cat.class), user, "Teste", null, true, created);
    var stock = new StockItem("Teste", "Medicamento", BigDecimal.TEN, "unidade", null);
    return PrescribedMedication.fromInternal(
        prescription,
        stock,
        "dose de teste",
        AdministrationRoute.Oral,
        12,
        1,
        LocalDate.of(2026, 10, 8),
        created);
  }
}
