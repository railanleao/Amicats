package org.amicats.backend.domain.usecase.roomtransfer.create;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import java.util.Optional;
import org.amicats.backend.domain.entity.Cat;
import org.amicats.backend.domain.entity.Room;
import org.amicats.backend.domain.entity.RoomTransfer;
import org.amicats.backend.domain.enums.GeneralStatus;
import org.amicats.backend.domain.interfaces.dataprovider.cat.CatDataProvider;
import org.amicats.backend.domain.interfaces.dataprovider.room.RoomDataProvider;
import org.amicats.backend.domain.interfaces.dataprovider.roomtransfer.RoomTransferDataProvider;
import org.amicats.backend.domain.usecase.cat.read.ReadCatOutput;
import org.amicats.backend.exception.InvalidRoomTransferException;
import org.amicats.backend.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class CreateRoomTransferUseCaseTest {

  private static final Integer CAT_ID = 1;

  @Mock private CatDataProvider catDataProvider;
  @Mock private RoomDataProvider roomDataProvider;
  @Mock private RoomTransferDataProvider roomTransferDataProvider;

  private CreateRoomTransferUseCase useCase;

  @BeforeEach
  void setUp() {
    Clock clock = Clock.fixed(Instant.parse("2026-09-30T15:00:00Z"), ZoneId.of("UTC"));

    useCase =
        CreateRoomTransferUseCase.builder()
            .catDataProvider(catDataProvider)
            .roomDataProvider(roomDataProvider)
            .roomTransferDataProvider(roomTransferDataProvider)
            .clock(clock)
            .build();
  }

  @Test
  void movesTheCatToTheNewRoomAndRecordsTheTransfer() {
    Room fromRoom = room(1, "Quarentena");
    Room toRoom = room(2, "Observação Intensiva");
    Cat cat = cat(fromRoom);
    when(catDataProvider.findById(CAT_ID)).thenReturn(Optional.of(cat));
    when(roomDataProvider.findById(2)).thenReturn(Optional.of(toRoom));

    ReadCatOutput output = useCase.execute(CAT_ID, new CreateRoomTransferInput(2, "Alta clínica."));

    assertThat(output.roomId()).isEqualTo(2);
    assertThat(cat.getRoom()).isEqualTo(toRoom);
    verify(catDataProvider).saveCat(cat);

    ArgumentCaptor<RoomTransfer> captor = ArgumentCaptor.forClass(RoomTransfer.class);
    verify(roomTransferDataProvider).save(captor.capture());
    RoomTransfer saved = captor.getValue();
    assertThat(saved.getFromRoom()).isEqualTo(fromRoom);
    assertThat(saved.getToRoom()).isEqualTo(toRoom);
    assertThat(saved.getReason()).isEqualTo("Alta clínica.");
  }

  @Test
  void allowsTransferringACatThatHadNoRoom() {
    Room toRoom = room(2, "Observação Intensiva");
    Cat cat = cat(null);
    when(catDataProvider.findById(CAT_ID)).thenReturn(Optional.of(cat));
    when(roomDataProvider.findById(2)).thenReturn(Optional.of(toRoom));

    useCase.execute(CAT_ID, new CreateRoomTransferInput(2, "Resgatada sem sala definida."));

    ArgumentCaptor<RoomTransfer> captor = ArgumentCaptor.forClass(RoomTransfer.class);
    verify(roomTransferDataProvider).save(captor.capture());
    assertThat(captor.getValue().getFromRoom()).isNull();
  }

  @Test
  void trimsTheReason() {
    Room toRoom = room(2, "Observação Intensiva");
    Cat cat = cat(room(1, "Quarentena"));
    when(catDataProvider.findById(CAT_ID)).thenReturn(Optional.of(cat));
    when(roomDataProvider.findById(2)).thenReturn(Optional.of(toRoom));

    useCase.execute(CAT_ID, new CreateRoomTransferInput(2, "  Alta clínica.  "));

    ArgumentCaptor<RoomTransfer> captor = ArgumentCaptor.forClass(RoomTransfer.class);
    verify(roomTransferDataProvider).save(captor.capture());
    assertThat(captor.getValue().getReason()).isEqualTo("Alta clínica.");
  }

  @Test
  void rejectsTransferringToTheSameRoom() {
    Room room = room(1, "Quarentena");
    Cat cat = cat(room);
    when(catDataProvider.findById(CAT_ID)).thenReturn(Optional.of(cat));
    when(roomDataProvider.findById(1)).thenReturn(Optional.of(room));

    assertThatThrownBy(() -> useCase.execute(CAT_ID, new CreateRoomTransferInput(1, "Motivo")))
        .isInstanceOf(InvalidRoomTransferException.class);
    verify(roomTransferDataProvider, never()).save(any());
    verify(catDataProvider, never()).saveCat(any());
  }

  @Test
  void rejectsAnUnknownCat() {
    when(catDataProvider.findById(CAT_ID)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> useCase.execute(CAT_ID, new CreateRoomTransferInput(2, "Motivo")))
        .isInstanceOf(ResourceNotFoundException.class);
    verifyNoInteractions(roomDataProvider, roomTransferDataProvider);
  }

  @Test
  void rejectsAnUnknownRoom() {
    Cat cat = cat(room(1, "Quarentena"));
    when(catDataProvider.findById(CAT_ID)).thenReturn(Optional.of(cat));
    when(roomDataProvider.findById(99)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> useCase.execute(CAT_ID, new CreateRoomTransferInput(99, "Motivo")))
        .isInstanceOf(ResourceNotFoundException.class);
    verifyNoInteractions(roomTransferDataProvider);
  }

  private static Room room(Integer id, String title) {
    Room room = new Room(title, null, null, 10);
    ReflectionTestUtils.setField(room, "id", id);
    return room;
  }

  private static Cat cat(Room room) {
    Cat cat =
        new Cat(
            "Nina",
            room,
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
