package org.amicats.backend.domain.usecase.user.deactivate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;
import org.amicats.backend.domain.entity.User;
import org.amicats.backend.domain.enums.AccessType;
import org.amicats.backend.domain.interfaces.dataprovider.user.UserDataProvider;
import org.amicats.backend.exception.ResourceNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class DeactivateUserUseCaseTest {

  @Mock private UserDataProvider userDataProvider;

  private DeactivateUserUseCase useCase() {
    return DeactivateUserUseCase.builder().userDataProvider(userDataProvider).build();
  }

  @Test
  void marksTheUserAsInactiveAndPersistsIt() {
    User user = new User("Marina Alves", null, null, AccessType.Assistant, null, null, null);
    when(userDataProvider.findById(1)).thenReturn(Optional.of(user));

    useCase().execute(1);

    ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
    verify(userDataProvider).saveUser(captor.capture());
    assertThat(captor.getValue().isActive()).isFalse();
  }

  @Test
  void rejectsWhenTheUserIsNotFound() {
    when(userDataProvider.findById(99)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> useCase().execute(99)).isInstanceOf(ResourceNotFoundException.class);
    verify(userDataProvider, never()).saveUser(any());
  }
}
