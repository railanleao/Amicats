package org.amicats.backend.domain.usecase.cat.update;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import org.amicats.backend.domain.entity.Cat;
import org.amicats.backend.domain.entity.Room;
import org.amicats.backend.domain.entity.User;
import org.amicats.backend.domain.enums.AccessType;
import org.amicats.backend.domain.enums.GeneralStatus;
import org.amicats.backend.domain.enums.Sex;
import org.amicats.backend.domain.interfaces.dataprovider.cat.CatDataProvider;
import org.amicats.backend.domain.interfaces.dataprovider.room.RoomDataProvider;
import org.amicats.backend.domain.usecase.cat.read.ReadCatOutput;
import org.amicats.backend.exception.ResourceNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class UpdateCatUseCaseTest {

  private static final Integer CAT_ID = 1;

  @Mock private CatDataProvider catDataProvider;
  @Mock private RoomDataProvider roomDataProvider;

  private UpdateCatUseCase useCase() {
    return UpdateCatUseCase.builder()
        .catDataProvider(catDataProvider)
        .roomDataProvider(roomDataProvider)
        .build();
  }

  private Cat existingCat() {
    Cat cat =
        new Cat(
            "Mingau",
            null,
            Sex.Male,
            LocalDate.now().minusYears(2),
            "Tricolor",
            new BigDecimal("3.50"),
            null,
            GeneralStatus.InTriage,
            null,
            null,
            null,
            null,
            null,
            null,
            aUser());
    ReflectionTestUtils.setField(cat, "id", CAT_ID);
    return cat;
  }

  private static User aUser() {
    User user = new User("Rafael", null, null, AccessType.Veterinarian, "12345", "MG", null);
    ReflectionTestUtils.setField(user, "id", 5);
    return user;
  }

  private static Room aRoom(Integer id) {
    Room room = new Room("Sala Azul", null, null, 4);
    ReflectionTestUtils.setField(room, "id", id);
    return room;
  }

  @Test
  void updatesTheCatBasicDetails() {
    when(catDataProvider.findById(CAT_ID)).thenReturn(Optional.of(existingCat()));

    ReadCatOutput output = useCase().execute(CAT_ID, anInput());

    assertThat(output.name()).isEqualTo("Mingau Editado");
    assertThat(output.sex()).isEqualTo(Sex.Female);
    assertThat(output.coat()).isEqualTo("Cinza");
    assertThat(output.microchip()).isEqualTo("123456789012345");
  }

  @Test
  void resolvesTheInformedRoomAndReassignsIt() {
    Room room = aRoom(7);
    when(catDataProvider.findById(CAT_ID)).thenReturn(Optional.of(existingCat()));
    when(roomDataProvider.findById(7)).thenReturn(Optional.of(room));

    ReadCatOutput output = useCase().execute(CAT_ID, anInputWithRoom(7));

    assertThat(output.roomId()).isEqualTo(room.getId());
  }

  @Test
  void clearsTheRoomWhenNoneIsInformed() {
    Cat cat = existingCat();
    cat.assignRoom(aRoom(3));
    when(catDataProvider.findById(CAT_ID)).thenReturn(Optional.of(cat));

    ReadCatOutput output = useCase().execute(CAT_ID, anInputWithRoom(null));

    assertThat(output.roomId()).isNull();
  }

  @Test
  void rejectsAnInexistentRoom() {
    when(catDataProvider.findById(CAT_ID)).thenReturn(Optional.of(existingCat()));
    when(roomDataProvider.findById(999)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> useCase().execute(CAT_ID, anInputWithRoom(999)))
        .isInstanceOf(ResourceNotFoundException.class);

    verify(catDataProvider, never()).saveCat(any());
  }

  @Test
  void rejectsAnInexistentCat() {
    when(catDataProvider.findById(999)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> useCase().execute(999, anInput()))
        .isInstanceOf(ResourceNotFoundException.class);

    verify(catDataProvider, never()).saveCat(any());
  }

  @Test
  void keepsTheCurrentGeneralStatusWhenNotInformed() {
    when(catDataProvider.findById(CAT_ID)).thenReturn(Optional.of(existingCat()));

    ReadCatOutput output = useCase().execute(CAT_ID, anInputWithStatus(null));

    assertThat(output.generalStatus()).isEqualTo(GeneralStatus.InTriage);
  }

  private static UpdateCatInput anInput() {
    return new UpdateCatInput(
        "Mingau Editado",
        null,
        Sex.Female,
        LocalDate.now().minusYears(3),
        "Cinza",
        new BigDecimal("4.00"),
        "Dócil",
        GeneralStatus.AvailableForAdoption,
        "123456789012345",
        LocalDate.now(),
        "Encontrado na rua",
        "Maria",
        "11999998888",
        "Ração");
  }

  private static UpdateCatInput anInputWithRoom(Integer roomId) {
    UpdateCatInput base = anInput();
    return new UpdateCatInput(
        base.name(),
        roomId,
        base.sex(),
        base.estimatedBirthDate(),
        base.coat(),
        base.weightKg(),
        base.characteristics(),
        base.generalStatus(),
        base.microchip(),
        base.rescueDate(),
        base.foundConditions(),
        base.sponsorName(),
        base.sponsorPhone(),
        base.sponsorFunding());
  }

  private static UpdateCatInput anInputWithStatus(GeneralStatus status) {
    UpdateCatInput base = anInput();
    return new UpdateCatInput(
        base.name(),
        base.roomId(),
        base.sex(),
        base.estimatedBirthDate(),
        base.coat(),
        base.weightKg(),
        base.characteristics(),
        status,
        base.microchip(),
        base.rescueDate(),
        base.foundConditions(),
        base.sponsorName(),
        base.sponsorPhone(),
        base.sponsorFunding());
  }
}
