package org.amicats.backend.domain.usecase.prescribedmedication.create;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Optional;
import org.amicats.backend.domain.entity.*;
import org.amicats.backend.domain.enums.AdministrationRoute;
import org.amicats.backend.domain.interfaces.dataprovider.prescribedmedication.PrescribedMedicationDataProvider;
import org.amicats.backend.domain.interfaces.dataprovider.stock.StockItemDataProvider;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

class CreatePrescribedMedicationCalendarTest {
  @Test
  void prescriptionCreatedAtNightUsesTheClinicalDateRatherThanTheNextUtcDay() {
    var stocks = mock(StockItemDataProvider.class);
    var medications = mock(PrescribedMedicationDataProvider.class);
    var cat = mock(Cat.class);
    when(cat.getId()).thenReturn(3);
    var stock = new StockItem("Teste", "Medicamento", BigDecimal.TEN, "unidade", null);
    ReflectionTestUtils.setField(stock, "id", 5);
    when(stocks.findById(5)).thenReturn(Optional.of(stock));
    var created = LocalDateTime.parse("2026-10-09T02:00:00");
    var prescription =
        new InternalMedicalPrescription(cat, mock(User.class), "Teste", null, true, created);
    var useCase =
        CreatePrescribedMedicationUseCase.builder()
            .stockItemDataProvider(stocks)
            .prescribedMedicationDataProvider(medications)
            .clinicalZone(ZoneId.of("America/Sao_Paulo"))
            .build();
    var output =
        useCase.execute(
            prescription,
            new CreatePrescribedMedicationInput(
                5, null, null, "teste", AdministrationRoute.Oral, 12, 1));
    assertThat(output.startDate()).isEqualTo(LocalDate.of(2026, 10, 8));
    assertThat(output.endDate()).isEqualTo(LocalDate.of(2026, 10, 8));
    verify(medications).findActiveByCatAndMedication(3, 5, LocalDate.of(2026, 10, 8));
  }
}
