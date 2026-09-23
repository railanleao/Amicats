package org.amicats.backend.domain.usecase.cat.create;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import org.amicats.backend.domain.entity.Room;
import org.amicats.backend.domain.entity.User;
import org.amicats.backend.domain.enums.AccessType;
import org.amicats.backend.domain.enums.GeneralStatus;
import org.amicats.backend.domain.enums.Sex;
import org.amicats.backend.domain.interfaces.dataprovider.cat.CatDataProvider;
import org.amicats.backend.domain.interfaces.dataprovider.room.RoomDataProvider;
import org.amicats.backend.domain.interfaces.dataprovider.user.UserDataProvider;
import org.amicats.backend.domain.usecase.cat.read.ReadCatOutput;
import org.amicats.backend.exception.ResourceNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class CreateCatUseCaseTest {

  private static final Integer CREATOR_ID = 5;

  @Mock private CatDataProvider catDataProvider;
  @Mock private RoomDataProvider roomDataProvider;
  @Mock private UserDataProvider userDataProvider;

  private CreateCatUseCase useCase() {
    return CreateCatUseCase.builder()
        .catDataProvider(catDataProvider)
        .roomDataProvider(roomDataProvider)
        .userDataProvider(userDataProvider)
        .build();
  }

  @Test
  void createsACatWithTheGivenDetails() {
    when(userDataProvider.findById(CREATOR_ID)).thenReturn(Optional.of(aUser()));
    when(catDataProvider.saveCat(any())).thenAnswer(invocation -> invocation.getArgument(0));

    ReadCatOutput output = useCase().execute(anInput(), CREATOR_ID);

    assertThat(output.name()).isEqualTo("Mingau");
    assertThat(output.sex()).isEqualTo(Sex.Male);
    assertThat(output.roomId()).isNull();
  }

  @Test
  void defaultsTheGeneralStatusToInTriageWhenNotInformed() {
    when(userDataProvider.findById(CREATOR_ID)).thenReturn(Optional.of(aUser()));
    when(catDataProvider.saveCat(any())).thenAnswer(invocation -> invocation.getArgument(0));

    ReadCatOutput output = useCase().execute(anInputWithStatus(null), CREATOR_ID);

    assertThat(output.generalStatus()).isEqualTo(GeneralStatus.InTriage);
  }

  @Test
  void resolvesTheInformedRoomAndLinksItToTheCat() {
    Room room = aRoom();
    when(userDataProvider.findById(CREATOR_ID)).thenReturn(Optional.of(aUser()));
    when(roomDataProvider.findById(7)).thenReturn(Optional.of(room));
    when(catDataProvider.saveCat(any())).thenAnswer(invocation -> invocation.getArgument(0));

    ReadCatOutput output = useCase().execute(anInputWithRoom(7), CREATOR_ID);

    assertThat(output.roomId()).isEqualTo(room.getId());
  }

  @Test
  void rejectsAnInexistentRoom() {
    // Room is resolved before the creator, so userDataProvider is never reached here.
    when(roomDataProvider.findById(999)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> useCase().execute(anInputWithRoom(999), CREATOR_ID))
        .isInstanceOf(ResourceNotFoundException.class);

    verify(catDataProvider, never()).saveCat(any());
  }

  @Test
  void rejectsAnInexistentCreator() {
    when(userDataProvider.findById(CREATOR_ID)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> useCase().execute(anInput(), CREATOR_ID))
        .isInstanceOf(ResourceNotFoundException.class);

    verify(catDataProvider, never()).saveCat(any());
  }

  @Test
  void linksTheAuthenticatedUserAsTheCreator() {
    User creator = aUser();
    when(userDataProvider.findById(CREATOR_ID)).thenReturn(Optional.of(creator));
    when(catDataProvider.saveCat(any())).thenAnswer(invocation -> invocation.getArgument(0));

    useCase().execute(anInput(), CREATOR_ID);

    verify(catDataProvider).saveCat(argThat(cat -> cat.getCreatedBy() == creator));
  }

  private static CreateCatInput anInput() {
    return new CreateCatInput(
        "Mingau",
        null,
        Sex.Male,
        LocalDate.now().minusYears(2),
        "Tricolor, curto",
        new BigDecimal("3.50"),
        null,
        GeneralStatus.InTriage,
        null,
        LocalDate.now(),
        null,
        null,
        null,
        null);
  }

  private static CreateCatInput anInputWithRoom(Integer roomId) {
    CreateCatInput base = anInput();
    return new CreateCatInput(
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

  private static CreateCatInput anInputWithStatus(GeneralStatus status) {
    CreateCatInput base = anInput();
    return new CreateCatInput(
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

  private static Room aRoom() {
    Room room = new Room("Sala Azul", null, null, 4);
    ReflectionTestUtils.setField(room, "id", 7);
    return room;
  }

  private static User aUser() {
    User user = new User("Rafael", null, null, AccessType.Veterinarian, "12345", "MG", null);
    ReflectionTestUtils.setField(user, "id", CREATOR_ID);
    return user;
  }
}
