package org.amicats.backend.domain.usecase.stock.update;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.util.Optional;
import org.amicats.backend.domain.entity.StockItem;
import org.amicats.backend.domain.interfaces.dataprovider.stock.StockItemDataProvider;
import org.amicats.backend.exception.StockConsumptionConflictException;
import org.junit.jupiter.api.Test;

class UpdateStockItemUseCaseTest {
  @Test
  void staleEditCannotOverwriteADoseDebit() {
    var stocks = mock(StockItemDataProvider.class);
    var stock = new StockItem("Teste", "Medicamento", new BigDecimal("9"), "ml", null);
    when(stocks.findByIdForUpdate(5)).thenReturn(Optional.of(stock));
    var useCase = UpdateStockItemUseCase.builder().stockItemDataProvider(stocks).build();
    var input =
        new UpdateStockItemInput(
            "Teste", "Medicamento", BigDecimal.TEN, "ml", null, BigDecimal.TEN);
    assertThatThrownBy(() -> useCase.execute(5, input))
        .isInstanceOf(StockConsumptionConflictException.class);
    assertThat(stock.getQuantity()).isEqualByComparingTo("9");
    verify(stocks, never()).save(any());
  }
}
