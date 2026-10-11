package org.amicats.backend.domain.usecase.prescribedmedication.read;

import static org.mockito.Mockito.*;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;
import org.amicats.backend.domain.entity.Cat;
import org.amicats.backend.domain.interfaces.dataprovider.cat.CatDataProvider;
import org.amicats.backend.domain.interfaces.dataprovider.prescribedmedication.PrescribedMedicationDataProvider;
import org.junit.jupiter.api.Test;

class ReadPrescribedMedicationCalendarTest {
  @Test
  void keepsTheLastClinicalDayActiveAfterMidnightUtc() {
    var cats = mock(CatDataProvider.class);
    var medications = mock(PrescribedMedicationDataProvider.class);
    when(cats.findById(3)).thenReturn(Optional.of(mock(Cat.class)));
    when(medications.findActiveByCat(3, LocalDate.of(2026, 10, 8))).thenReturn(List.of());
    var useCase =
        ReadPrescribedMedicationUseCase.builder()
            .catDataProvider(cats)
            .prescribedMedicationDataProvider(medications)
            .clock(Clock.fixed(Instant.parse("2026-10-09T02:00:00Z"), ZoneId.of("Asia/Tokyo")))
            .clinicalZone(ZoneId.of("America/Sao_Paulo"))
            .build();
    useCase.findActiveByCat(3);
    verify(medications).findActiveByCat(3, LocalDate.of(2026, 10, 8));
  }
}
