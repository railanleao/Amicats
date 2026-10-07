package org.amicats.backend.domain.usecase.sync.pull;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.amicats.backend.domain.entity.Room;
import org.amicats.backend.domain.entity.StockItem;
import org.amicats.backend.domain.enums.AccessType;
import org.amicats.backend.domain.interfaces.dataprovider.stock.StockEntryDataProvider;
import org.amicats.backend.domain.interfaces.dataprovider.sync.SyncChangesDataProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class ReadSyncChangesUseCaseTest {

  private static final LocalDateTime SINCE = LocalDateTime.of(2026, 10, 1, 10, 0);

  @Mock private SyncChangesDataProvider syncChangesDataProvider;
  @Mock private StockEntryDataProvider stockEntryDataProvider;

  private ReadSyncChangesUseCase useCase;

  @BeforeEach
  void setUp() {
    useCase =
        ReadSyncChangesUseCase.builder()
            .syncChangesDataProvider(syncChangesDataProvider)
            .stockEntryDataProvider(stockEntryDataProvider)
            .build();
  }

  @Test
  void returnsTheSameCursorWhenNothingChanged() {
    givenNoChanges();

    SyncChangesOutput output = useCase.execute(SINCE, AccessType.Assistant);

    assertThat(output.cursor()).isEqualTo(SINCE);
    assertThat(output.rooms()).isEmpty();
  }

  @Test
  void returnsNoCursorOnTheFirstPullWhenThereIsNothing() {
    givenNoChanges();

    assertThat(useCase.execute(null, AccessType.Assistant).cursor()).isNull();
  }

  @Test
  void advancesTheCursorToTheLatestChangeMinusTheOverlap() {
    givenNoChanges();
    when(syncChangesDataProvider.findRoomsUpdatedSince(SINCE))
        .thenReturn(
            List.of(
                room(1, LocalDateTime.of(2026, 10, 1, 11, 0)),
                room(2, LocalDateTime.of(2026, 10, 1, 12, 30))));

    SyncChangesOutput output = useCase.execute(SINCE, AccessType.Assistant);

    assertThat(output.rooms()).hasSize(2);
    assertThat(output.cursor()).isEqualTo(LocalDateTime.of(2026, 10, 1, 12, 29));
  }

  @Test
  void neverMovesTheCursorBackwards() {
    givenNoChanges();
    when(syncChangesDataProvider.findRoomsUpdatedSince(SINCE))
        .thenReturn(List.of(room(1, SINCE.plusSeconds(10))));

    assertThat(useCase.execute(SINCE, AccessType.Assistant).cursor()).isEqualTo(SINCE);
  }

  @Test
  void viewersDoNotReceiveStockItems() {
    givenNoChanges();

    SyncChangesOutput output = useCase.execute(SINCE, AccessType.Viewer);

    assertThat(output.stockItems()).isEmpty();
    verify(syncChangesDataProvider, never()).findStockItemsUpdatedSince(any());
  }

  @Test
  void stockItemsCarryTheirNearestExpirationDate() {
    givenNoChanges();
    StockItem item = new StockItem("Amoxicilina", "Medicamento", BigDecimal.ONE, "ml", null);
    ReflectionTestUtils.setField(item, "id", 7);
    ReflectionTestUtils.setField(item, "updatedAt", SINCE.plusMinutes(5));
    when(syncChangesDataProvider.findStockItemsUpdatedSince(SINCE)).thenReturn(List.of(item));
    when(stockEntryDataProvider.findNearestExpirationDate(eq(7), any(LocalDate.class)))
        .thenReturn(Optional.of(LocalDate.of(2027, 1, 31)));

    SyncChangesOutput output = useCase.execute(SINCE, AccessType.Veterinarian);

    assertThat(output.stockItems())
        .singleElement()
        .satisfies(
            stock -> assertThat(stock.expirationDate()).isEqualTo(LocalDate.of(2027, 1, 31)));
  }

  private void givenNoChanges() {
    org.mockito.Mockito.lenient()
        .when(syncChangesDataProvider.findCatsUpdatedSince(any()))
        .thenReturn(List.of());
    org.mockito.Mockito.lenient()
        .when(syncChangesDataProvider.findRoomsUpdatedSince(any()))
        .thenReturn(List.of());
    org.mockito.Mockito.lenient()
        .when(syncChangesDataProvider.findStockItemsUpdatedSince(any()))
        .thenReturn(List.of());
    org.mockito.Mockito.lenient()
        .when(syncChangesDataProvider.findPrescribedMedicationsUpdatedSince(any()))
        .thenReturn(List.of());
  }

  private Room room(Integer id, LocalDateTime updatedAt) {
    Room room = new Room("Sala " + id, null, null, 3);
    ReflectionTestUtils.setField(room, "id", id);
    ReflectionTestUtils.setField(room, "updatedAt", updatedAt);
    return room;
  }
}
