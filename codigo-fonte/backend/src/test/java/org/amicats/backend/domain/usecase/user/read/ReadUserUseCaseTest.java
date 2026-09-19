package org.amicats.backend.domain.usecase.user.read;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.groups.Tuple.tuple;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;
import org.amicats.backend.domain.entity.User;
import org.amicats.backend.domain.enums.AccessType;
import org.amicats.backend.domain.interfaces.dataprovider.user.UserDataProvider;
import org.amicats.backend.domain.interfaces.dataprovider.user.UserWithEmail;
import org.amicats.backend.domain.usecase.common.PagedResult;
import org.amicats.backend.exception.ResourceNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class ReadUserUseCaseTest {

  @Mock private UserDataProvider userDataProvider;

  private ReadUserUseCase useCase() {
    return ReadUserUseCase.builder().userDataProvider(userDataProvider).build();
  }

  private User userWithId(String fullName, AccessType accessType, int id) {
    User user = new User(fullName, null, null, accessType, null, null, null);
    ReflectionTestUtils.setField(user, "id", id);
    return user;
  }

  @Test
  void findByIdReturnsTheUserWithItsEmail() {
    User user = userWithId("Marina Alves", AccessType.Assistant, 1);
    when(userDataProvider.findById(1)).thenReturn(Optional.of(user));
    when(userDataProvider.findEmailByUserId(1))
        .thenReturn(Optional.of("marina.alves@amicats.org.br"));

    ReadUserOutput output = useCase().findById(1);

    assertThat(output.fullName()).isEqualTo("Marina Alves");
    assertThat(output.email()).isEqualTo("marina.alves@amicats.org.br");
    assertThat(output.active()).isTrue();
  }

  @Test
  void findByIdRejectsWhenTheUserIsNotFound() {
    when(userDataProvider.findById(99)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> useCase().findById(99)).isInstanceOf(ResourceNotFoundException.class);
  }

  @Test
  void searchIncludesInactiveUsersAndToleratesAMissingAuthRecord() {
    User active = userWithId("Marina Alves", AccessType.Assistant, 1);
    User inactive = userWithId("Carla Souza", AccessType.Veterinarian, 2);
    inactive.deactive();

    when(userDataProvider.search(any()))
        .thenReturn(
            new PagedResult<>(
                List.of(
                    new UserWithEmail(active, "marina.alves@amicats.org.br"),
                    new UserWithEmail(inactive, null)),
                0,
                20,
                2,
                1));

    PagedResult<ReadUserOutput> result =
        useCase().search(new UserSearchCriteria(null, null, null, 0, 20));

    assertThat(result.content())
        .extracting(ReadUserOutput::fullName, ReadUserOutput::active, ReadUserOutput::email)
        .containsExactlyInAnyOrder(
            tuple("Marina Alves", true, "marina.alves@amicats.org.br"),
            tuple("Carla Souza", false, null));
    assertThat(result.totalElements()).isEqualTo(2);
    assertThat(result.totalPages()).isEqualTo(1);
  }

  @Test
  void searchPassesTheCriteriaThroughUnchangedWhenWithinBounds() {
    when(userDataProvider.search(any())).thenReturn(new PagedResult<>(List.of(), 2, 10, 0, 0));

    useCase().search(new UserSearchCriteria("marina", AccessType.Administrator, true, 2, 10));

    ArgumentCaptor<UserSearchCriteria> captor = ArgumentCaptor.forClass(UserSearchCriteria.class);
    verify(userDataProvider).search(captor.capture());
    assertThat(captor.getValue())
        .isEqualTo(new UserSearchCriteria("marina", AccessType.Administrator, true, 2, 10));
  }

  @Test
  void searchClampsANegativePageToZero() {
    when(userDataProvider.search(any())).thenReturn(new PagedResult<>(List.of(), 0, 20, 0, 0));

    useCase().search(new UserSearchCriteria(null, null, null, -5, 20));

    ArgumentCaptor<UserSearchCriteria> captor = ArgumentCaptor.forClass(UserSearchCriteria.class);
    verify(userDataProvider).search(captor.capture());
    assertThat(captor.getValue().page()).isZero();
  }

  @Test
  void searchClampsAnOversizedPageSizeToTheMaximum() {
    when(userDataProvider.search(any())).thenReturn(new PagedResult<>(List.of(), 0, 100, 0, 0));

    useCase().search(new UserSearchCriteria(null, null, null, 0, 100_000));

    ArgumentCaptor<UserSearchCriteria> captor = ArgumentCaptor.forClass(UserSearchCriteria.class);
    verify(userDataProvider).search(captor.capture());
    assertThat(captor.getValue().size()).isEqualTo(100);
  }

  @Test
  void searchFallsBackToTheDefaultPageSizeWhenZeroOrNegative() {
    when(userDataProvider.search(any())).thenReturn(new PagedResult<>(List.of(), 0, 20, 0, 0));

    useCase().search(new UserSearchCriteria(null, null, null, 0, 0));

    ArgumentCaptor<UserSearchCriteria> captor = ArgumentCaptor.forClass(UserSearchCriteria.class);
    verify(userDataProvider).search(captor.capture());
    assertThat(captor.getValue().size()).isEqualTo(20);
  }
}
