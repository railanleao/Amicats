package org.amicats.backend.domain.usecase.room.update;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import java.util.Optional;
import org.amicats.backend.domain.entity.Room;
import org.amicats.backend.domain.interfaces.dataprovider.room.RoomDataProvider;
import org.amicats.backend.domain.usecase.room.read.ReadRoomOutput;
import org.amicats.backend.exception.ResourceNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class UpdateRoomUseCaseTest {

  @Mock private RoomDataProvider roomDataProvider;

  private UpdateRoomUseCase useCase() {
    return UpdateRoomUseCase.builder().roomDataProvider(roomDataProvider).build();
  }

  private Room roomWithId(int id) {
    Room room = new Room("Sala Antiga", "Descrição antiga", null, 2);
    ReflectionTestUtils.setField(room, "id", id);
    return room;
  }

  @Test
  void updatesTheRoomDetails() {
    Room room = roomWithId(1);
    when(roomDataProvider.findById(1)).thenReturn(Optional.of(room));

    ReadRoomOutput output =
        useCase().execute(1, new UpdateRoomInput("Sala Nova", "Descrição nova", null, 6));

    assertThat(output.title()).isEqualTo("Sala Nova");
    assertThat(output.description()).isEqualTo("Descrição nova");
    assertThat(output.maxCapacity()).isEqualTo(6);
  }

  @Test
  void rejectsWhenTheRoomIsNotFound() {
    when(roomDataProvider.findById(99)).thenReturn(Optional.empty());

    assertThatThrownBy(
            () -> useCase().execute(99, new UpdateRoomInput("Sala Nova", null, null, null)))
        .isInstanceOf(ResourceNotFoundException.class);
  }
}
