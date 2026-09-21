package org.amicats.backend.domain.usecase.room.create;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.amicats.backend.domain.entity.Room;
import org.amicats.backend.domain.interfaces.dataprovider.room.RoomDataProvider;
import org.amicats.backend.domain.usecase.room.read.ReadRoomOutput;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class CreateRoomUseCaseTest {

  @Mock private RoomDataProvider roomDataProvider;

  private CreateRoomUseCase useCase() {
    return CreateRoomUseCase.builder().roomDataProvider(roomDataProvider).build();
  }

  @Test
  void createsAnActiveRoomWithTheGivenDetails() {
    when(roomDataProvider.saveRoom(any())).thenAnswer(invocation -> invocation.getArgument(0));

    ReadRoomOutput output =
        useCase().execute(new CreateRoomInput("Sala Azul", "Fica no fundo", null, 4));

    assertThat(output.title()).isEqualTo("Sala Azul");
    assertThat(output.description()).isEqualTo("Fica no fundo");
    assertThat(output.maxCapacity()).isEqualTo(4);
    assertThat(output.active()).isTrue();
    verify(roomDataProvider).saveRoom(any(Room.class));
  }
}
