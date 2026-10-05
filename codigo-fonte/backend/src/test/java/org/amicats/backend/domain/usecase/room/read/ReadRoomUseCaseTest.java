package org.amicats.backend.domain.usecase.room.read;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.groups.Tuple.tuple;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;
import org.amicats.backend.domain.entity.Room;
import org.amicats.backend.domain.interfaces.dataprovider.room.RoomDataProvider;
import org.amicats.backend.domain.usecase.common.PagedResult;
import org.amicats.backend.exception.ResourceNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class ReadRoomUseCaseTest {

  @Mock private RoomDataProvider roomDataProvider;

  private ReadRoomUseCase useCase() {
    return ReadRoomUseCase.builder().roomDataProvider(roomDataProvider).build();
  }

  private Room roomWithId(String title, int id) {
    Room room = new Room(title, null, null, null);
    ReflectionTestUtils.setField(room, "id", id);
    return room;
  }

  @Test
  void findByIdReturnsTheRoom() {
    Room room = roomWithId("Sala Azul", 1);
    when(roomDataProvider.findById(1)).thenReturn(Optional.of(room));

    ReadRoomOutput output = useCase().findById(1);

    assertThat(output.title()).isEqualTo("Sala Azul");
    assertThat(output.active()).isTrue();
  }

  @Test
  void findByIdRejectsWhenTheRoomIsNotFound() {
    when(roomDataProvider.findById(99)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> useCase().findById(99)).isInstanceOf(ResourceNotFoundException.class);
  }

  @Test
  void searchIncludesInactiveRooms() {
    Room active = roomWithId("Sala Azul", 1);
    Room inactive = roomWithId("Sala Verde", 2);
    inactive.deactivate();

    when(roomDataProvider.search(any()))
        .thenReturn(new PagedResult<>(List.of(active, inactive), 0, 20, 2, 1));

    PagedResult<ReadRoomOutput> result =
        useCase().search(new RoomSearchCriteria(null, null, 0, 20));

    assertThat(result.content())
        .extracting(ReadRoomOutput::title, ReadRoomOutput::active)
        .containsExactlyInAnyOrder(tuple("Sala Azul", true), tuple("Sala Verde", false));
    assertThat(result.totalElements()).isEqualTo(2);
    assertThat(result.totalPages()).isEqualTo(1);
  }

  @Test
  void searchPassesTheCriteriaThroughUnchangedWhenWithinBounds() {
    when(roomDataProvider.search(any())).thenReturn(new PagedResult<>(List.of(), 2, 10, 0, 0));

    useCase().search(new RoomSearchCriteria("azul", true, 2, 10));

    ArgumentCaptor<RoomSearchCriteria> captor = ArgumentCaptor.forClass(RoomSearchCriteria.class);
    verify(roomDataProvider).search(captor.capture());
    assertThat(captor.getValue()).isEqualTo(new RoomSearchCriteria("azul", true, 2, 10));
  }

  @Test
  void searchClampsANegativePageToZero() {
    when(roomDataProvider.search(any())).thenReturn(new PagedResult<>(List.of(), 0, 20, 0, 0));

    useCase().search(new RoomSearchCriteria(null, null, -5, 20));

    ArgumentCaptor<RoomSearchCriteria> captor = ArgumentCaptor.forClass(RoomSearchCriteria.class);
    verify(roomDataProvider).search(captor.capture());
    assertThat(captor.getValue().page()).isZero();
  }

  @Test
  void searchClampsAnOversizedPageSizeToTheMaximum() {
    when(roomDataProvider.search(any())).thenReturn(new PagedResult<>(List.of(), 0, 100, 0, 0));

    useCase().search(new RoomSearchCriteria(null, null, 0, 100_000));

    ArgumentCaptor<RoomSearchCriteria> captor = ArgumentCaptor.forClass(RoomSearchCriteria.class);
    verify(roomDataProvider).search(captor.capture());
    assertThat(captor.getValue().size()).isEqualTo(100);
  }

  @Test
  void searchFallsBackToTheDefaultPageSizeWhenZeroOrNegative() {
    when(roomDataProvider.search(any())).thenReturn(new PagedResult<>(List.of(), 0, 20, 0, 0));

    useCase().search(new RoomSearchCriteria(null, null, 0, 0));

    ArgumentCaptor<RoomSearchCriteria> captor = ArgumentCaptor.forClass(RoomSearchCriteria.class);
    verify(roomDataProvider).search(captor.capture());
    assertThat(captor.getValue().size()).isEqualTo(20);
  }
}
