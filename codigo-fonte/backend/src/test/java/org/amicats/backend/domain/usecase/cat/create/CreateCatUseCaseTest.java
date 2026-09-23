package org.amicats.backend.domain.usecase.cat.create;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.Optional;
import org.amicats.backend.domain.entity.Room;
import org.amicats.backend.domain.entity.User;
import org.amicats.backend.domain.enums.AccessType;
import org.amicats.backend.domain.enums.CatClinicalStatus;
import org.amicats.backend.domain.enums.CatSex;
import org.amicats.backend.domain.enums.HealthTestResult;
import org.amicats.backend.domain.enums.NeuteredStatus;
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
  void createsACatWithTheGivenDetailsAndNoPhotosYet() {
    when(catDataProvider.saveCat(any())).thenAnswer(invocation -> invocation.getArgument(0));

    ReadCatOutput output = useCase().execute(anInput(), null);

    assertThat(output.name()).isEqualTo("Mingau");
    assertThat(output.sex()).isEqualTo(CatSex.Male);
    assertThat(output.fiv()).isEqualTo(HealthTestResult.Negative);
    assertThat(output.photoUrls()).isEmpty();
    assertThat(output.roomId()).isNull();
  }

  @Test
  void defaultsTheClinicalStatusToInTriageWhenNotInformed() {
    when(catDataProvider.saveCat(any())).thenAnswer(invocation -> invocation.getArgument(0));

    ReadCatOutput output = useCase().execute(anInput(), null);

    assertThat(output.clinicalStatus()).isEqualTo(CatClinicalStatus.InTriage);
  }

  @Test
  void resolvesTheInformedRoomAndLinksItToTheCat() {
    Room room = aRoom();
    when(roomDataProvider.findById(7)).thenReturn(Optional.of(room));
    when(catDataProvider.saveCat(any())).thenAnswer(invocation -> invocation.getArgument(0));

    ReadCatOutput output = useCase().execute(anInputWithRoom(7), null);

    assertThat(output.roomId()).isEqualTo(room.getId());
  }

  @Test
  void rejectsAnInexistentRoom() {
    when(roomDataProvider.findById(999)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> useCase().execute(anInputWithRoom(999), null))
        .isInstanceOf(ResourceNotFoundException.class);

    verify(catDataProvider, never()).saveCat(any());
  }

  @Test
  void linksTheAuthenticatedUserAsTheCreator() {
    User creator = aUser();
    when(userDataProvider.findById(5)).thenReturn(Optional.of(creator));
    when(catDataProvider.saveCat(any())).thenAnswer(invocation -> invocation.getArgument(0));

    useCase().execute(anInput(), 5);

    verify(catDataProvider)
        .saveCat(org.mockito.ArgumentMatchers.argThat(cat -> cat.getCreatedBy() == creator));
  }

  private static CreateCatInput anInput() {
    return new CreateCatInput(
        "Mingau",
        null,
        CatSex.Male,
        "4 anos",
        "Tricolor, curto",
        null,
        HealthTestResult.Negative,
        HealthTestResult.Negative,
        HealthTestResult.Untested,
        NeuteredStatus.No,
        null,
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
        base.estimatedAge(),
        base.coat(),
        base.microchip(),
        base.fiv(),
        base.felv(),
        base.pif(),
        base.neutered(),
        base.clinicalStatus(),
        base.healthNotes(),
        base.rescueDate(),
        base.rescueLocation(),
        base.sponsorName(),
        base.sponsorPhone(),
        base.sponsorCoverage());
  }

  private static Room aRoom() {
    Room room = new Room("Sala Azul", null, null, 4);
    ReflectionTestUtils.setField(room, "id", 7);
    return room;
  }

  private static User aUser() {
    User user = new User("Rafael", null, null, AccessType.Veterinarian, "12345", "MG", null);
    ReflectionTestUtils.setField(user, "id", 5);
    return user;
  }
}
