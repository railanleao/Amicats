package org.amicats.backend.domain.usecase.user.read;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.groups.Tuple.tuple;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;
import org.amicats.backend.domain.entity.User;
import org.amicats.backend.domain.enums.AccessType;
import org.amicats.backend.domain.interfaces.dataprovider.user.UserDataProvider;
import org.amicats.backend.exception.ResourceNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class ReadUserUseCaseTest {

  @Mock private UserDataProvider userDataProvider;

  private ReadUserUseCase useCase() {
    return ReadUserUseCase.builder().userDataProvider(userDataProvider).build();
  }

  @Test
  void findByIdReturnsTheUserWithItsEmail() {
    User user = new User("Marina Alves", null, null, AccessType.Assistant, null, null, null);
    ReflectionTestUtils.setField(user, "id", 1);
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
  void findAllIncludesInactiveUsersAndToleratesAMissingAuthRecord() {
    User active = new User("Marina Alves", null, null, AccessType.Assistant, null, null, null);
    User inactive = new User("Carla Souza", null, null, AccessType.Veterinarian, null, null, null);
    ReflectionTestUtils.setField(active, "id", 1);
    ReflectionTestUtils.setField(inactive, "id", 2);
    inactive.deactive();

    when(userDataProvider.findAll()).thenReturn(List.of(active, inactive));
    when(userDataProvider.findEmailByUserId(1))
        .thenReturn(Optional.of("marina.alves@amicats.org.br"));
    when(userDataProvider.findEmailByUserId(2)).thenReturn(Optional.empty());

    List<ReadUserOutput> outputs = useCase().findAll();

    assertThat(outputs).hasSize(2);
    assertThat(outputs)
        .extracting(ReadUserOutput::fullName, ReadUserOutput::active, ReadUserOutput::email)
        .containsExactlyInAnyOrder(
            tuple("Marina Alves", true, "marina.alves@amicats.org.br"),
            tuple("Carla Souza", false, null));
  }
}
