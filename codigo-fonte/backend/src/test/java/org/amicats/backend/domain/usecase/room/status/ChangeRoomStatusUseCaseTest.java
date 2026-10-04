package org.amicats.backend.domain.usecase.room.status;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;
import org.amicats.backend.domain.entity.Room;
import org.amicats.backend.domain.interfaces.dataprovider.room.RoomDataProvider;
import org.amicats.backend.exception.ResourceNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ChangeRoomStatusUseCaseTest {

  private static final Integer ROOM_ID = 1;

  @Mock private RoomDataProvider roomDataProvider;

  private ChangeRoomStatusUseCase useCase() {
    return ChangeRoomStatusUseCase.builder().roomDataProvider(roomDataProvider).build();
  }

  private Room aRoom() {
    return new Room("Sala Azul", null, null, null);
  }

  @Test
  void deactivatesAnActiveRoom() {
    Room room = aRoom();
    when(roomDataProvider.findById(ROOM_ID)).thenReturn(Optional.of(room));

    useCase().execute(ROOM_ID, false);

    assertThat(room.isActive()).isFalse();
    verify(roomDataProvider).saveRoom(room);
  }

  @Test
  void reactivatesAnInactiveRoom() {
    Room room = aRoom();
    room.deactivate();
    when(roomDataProvider.findById(ROOM_ID)).thenReturn(Optional.of(room));

    useCase().execute(ROOM_ID, true);

    assertThat(room.isActive()).isTrue();
    verify(roomDataProvider).saveRoom(room);
  }

  @Test
  void throwsWhenTheRoomDoesNotExist() {
    when(roomDataProvider.findById(99)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> useCase().execute(99, false))
        .isInstanceOf(ResourceNotFoundException.class);
  }
}
