package org.amicats.backend.domain.usecase.stock.alert;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.amicats.backend.domain.entity.StockItem;
import org.amicats.backend.domain.entity.User;
import org.amicats.backend.domain.enums.AccessType;
import org.amicats.backend.domain.enums.StockStatus;
import org.amicats.backend.domain.interfaces.dataprovider.stock.StockItemDataProvider;
import org.amicats.backend.domain.interfaces.dataprovider.user.UserDataProvider;
import org.amicats.backend.domain.usecase.common.PagedResult;
import org.amicats.backend.exception.DoseAdministrationAccessException;
import org.amicats.backend.exception.InvalidStockConsumptionException;
import org.junit.jupiter.api.Test;

class StockAlertUseCaseTest {
  @Test
  void derivesLowStatusFromTheConfiguredThresholdIncludingTheBoundary() {
    var stock = item("5");
    stock.changeMinimumQuantity(new BigDecimal("5"));
    assertThat(stock.getStatus()).isEqualTo(StockStatus.Low);
    stock.changeMinimumQuantity(new BigDecimal("4.5"));
    assertThat(stock.getStatus()).isEqualTo(StockStatus.Normal);
    stock.consume(new BigDecimal("0.5"));
    assertThat(stock.getStatus()).isEqualTo(StockStatus.Low);
  }

  @Test
  void distinguishesAnEmptyStockFromADivergence() {
    var zero = StockAlertOutput.from(item("0"));
    var negative = StockAlertOutput.from(item("-0.5"));
    assertThat(zero.status()).isEqualTo(StockStatus.OutOfStock);
    assertThat(zero.needsReconciliation()).isFalse();
    assertThat(negative.status()).isEqualTo(StockStatus.OutOfStock);
    assertThat(negative.needsReconciliation()).isTrue();
  }

  @Test
  void rejectsInvalidThresholds() {
    var stock = item("10");
    assertThatThrownBy(() -> stock.changeMinimumQuantity(new BigDecimal("-1")))
        .isInstanceOf(InvalidStockConsumptionException.class);
    assertThatThrownBy(() -> stock.changeMinimumQuantity(new BigDecimal("0.0001")))
        .isInstanceOf(InvalidStockConsumptionException.class);
  }

  @Test
  void paginatesAlertsAndPreservesTheirTotal() {
    var users = mock(UserDataProvider.class);
    var stocks = mock(StockItemDataProvider.class);
    when(users.findById(7)).thenReturn(Optional.of(user(AccessType.Assistant)));
    when(stocks.findMedicationAlerts(0, 100))
        .thenReturn(new PagedResult<>(List.of(item("2")), 0, 100, 101, 2));
    var result =
        StockAlertUseCase.builder()
            .userDataProvider(users)
            .stockItemDataProvider(stocks)
            .build()
            .list(7, -1, 500);
    assertThat(result.totalElements()).isEqualTo(101);
    assertThat(result.content().get(0).quantity()).isEqualByComparingTo("2");
  }

  @Test
  void blocksViewerFromReadingStockAlerts() {
    var users = mock(UserDataProvider.class);
    var stocks = mock(StockItemDataProvider.class);
    when(users.findById(7)).thenReturn(Optional.of(user(AccessType.Viewer)));
    var useCase =
        StockAlertUseCase.builder().userDataProvider(users).stockItemDataProvider(stocks).build();
    assertThatThrownBy(() -> useCase.list(7, 0, 20))
        .isInstanceOf(DoseAdministrationAccessException.class);
    verifyNoInteractions(stocks);
  }

  @Test
  void veterinarianCannotChangeMinimumQuantity() {
    var users = mock(UserDataProvider.class);
    var stocks = mock(StockItemDataProvider.class);
    when(users.findById(7)).thenReturn(Optional.of(user(AccessType.Veterinarian)));
    var useCase =
        StockAlertUseCase.builder().userDataProvider(users).stockItemDataProvider(stocks).build();
    assertThatThrownBy(
            () -> useCase.changeMinimum(5, 7, new ChangeMinimumQuantityInput(BigDecimal.TEN)))
        .isInstanceOf(DoseAdministrationAccessException.class);
    verifyNoInteractions(stocks);
  }

  @Test
  void assistantCanChangeMinimumWithTheStockLocked() {
    var users = mock(UserDataProvider.class);
    var stocks = mock(StockItemDataProvider.class);
    var stock = item("5");
    when(users.findById(7)).thenReturn(Optional.of(user(AccessType.Assistant)));
    when(stocks.findByIdForUpdate(5)).thenReturn(Optional.of(stock));
    when(stocks.save(stock)).thenReturn(stock);
    var output =
        StockAlertUseCase.builder()
            .userDataProvider(users)
            .stockItemDataProvider(stocks)
            .build()
            .changeMinimum(5, 7, new ChangeMinimumQuantityInput(new BigDecimal("3")));
    assertThat(output.minimumQuantity()).isEqualByComparingTo("3");
    assertThat(output.status()).isEqualTo(StockStatus.Normal);
  }

  private StockItem item(String quantity) {
    return new StockItem("Teste", "Medicamento", new BigDecimal(quantity), "ml", null);
  }

  private User user(AccessType role) {
    return new User("Teste", null, null, role, null, null, null);
  }
}
