package org.amicats.backend.domain.usecase.roomtransfer.read;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.amicats.backend.domain.entity.Cat;
import org.amicats.backend.domain.entity.Room;
import org.amicats.backend.domain.entity.RoomTransfer;
import org.amicats.backend.domain.enums.GeneralStatus;
import org.amicats.backend.domain.interfaces.dataprovider.cat.CatDataProvider;
import org.amicats.backend.domain.interfaces.dataprovider.roomtransfer.RoomTransferDataProvider;
import org.amicats.backend.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class ReadRoomTransferUseCaseTest {

  private static final Integer CAT_ID = 1;

  @Mock private CatDataProvider catDataProvider;
  @Mock private RoomTransferDataProvider roomTransferDataProvider;

  private ReadRoomTransferUseCase useCase;

  @BeforeEach
  void setUp() {
    useCase =
        ReadRoomTransferUseCase.builder()
            .catDataProvider(catDataProvider)
            .roomTransferDataProvider(roomTransferDataProvider)
            .build();
  }

  @Test
  void listsTransfersMostRecentFirst() {
    Cat cat = cat();
    when(catDataProvider.findById(CAT_ID)).thenReturn(Optional.of(cat));

    Room quarantine = room(1, "Quarentena");
    Room observation = room(2, "Observação Intensiva");
    RoomTransfer latest =
        new RoomTransfer(
            cat, quarantine, observation, "Alta clínica.", LocalDateTime.of(2025, 12, 12, 9, 0));
    when(roomTransferDataProvider.findByCatIdOrderByCreatedAtDesc(CAT_ID))
        .thenReturn(List.of(latest));

    List<ReadRoomTransferOutput> output = useCase.findByCat(CAT_ID);

    assertThat(output).hasSize(1);
    assertThat(output.get(0).fromRoomTitle()).isEqualTo("Quarentena");
    assertThat(output.get(0).toRoomTitle()).isEqualTo("Observação Intensiva");
    assertThat(output.get(0).reason()).isEqualTo("Alta clínica.");
  }

  @Test
  void returnsAnEmptyListWhenTheCatHasNeverBeenTransferred() {
    when(catDataProvider.findById(CAT_ID)).thenReturn(Optional.of(cat()));
    when(roomTransferDataProvider.findByCatIdOrderByCreatedAtDesc(CAT_ID)).thenReturn(List.of());

    assertThat(useCase.findByCat(CAT_ID)).isEmpty();
  }

  @Test
  void rejectsAnUnknownCat() {
    when(catDataProvider.findById(CAT_ID)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> useCase.findByCat(CAT_ID))
        .isInstanceOf(ResourceNotFoundException.class);
    verifyNoInteractions(roomTransferDataProvider);
  }

  private static Room room(Integer id, String title) {
    Room room = new Room(title, null, null, 10);
    ReflectionTestUtils.setField(room, "id", id);
    return room;
  }

  private static Cat cat() {
    Cat cat =
        new Cat(
            "Nina",
            null,
            null,
            null,
            null,
            null,
            null,
            GeneralStatus.InTriage,
            null,
            null,
            null,
            null,
            null,
            null,
            null);
    ReflectionTestUtils.setField(cat, "id", CAT_ID);
    return cat;
  }
}
