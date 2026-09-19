package org.amicats.backend.domain.usecase.user.status;

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
import org.amicats.backend.exception.SelfActionNotAllowedException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ChangeUserStatusUseCaseTest {

  private static final Integer ADMIN_ID = 1;
  private static final Integer USER_ID = 2;

  @Mock private UserDataProvider userDataProvider;

  private ChangeUserStatusUseCase useCase;

  @BeforeEach
  void setUp() {
    useCase = ChangeUserStatusUseCase.builder().userDataProvider(userDataProvider).build();
  }

  private User aUser() {
    return new User("Rafael", null, null, AccessType.Assistant, null, null, null);
  }

  @Test
  void deactivatesAnotherUser() {
    User user = aUser();
    when(userDataProvider.findById(USER_ID)).thenReturn(Optional.of(user));

    useCase.execute(USER_ID, false, ADMIN_ID);

    assertThat(user.isActive()).isFalse();
    verify(userDataProvider).saveUser(user);
  }

  @Test
  void reactivatesAnInactiveUser() {
    User user = aUser();
    user.deactivate();
    when(userDataProvider.findById(USER_ID)).thenReturn(Optional.of(user));

    useCase.execute(USER_ID, true, ADMIN_ID);

    assertThat(user.isActive()).isTrue();
    verify(userDataProvider).saveUser(user);
  }

  @Test
  void rejectsDeactivatingYourself() {
    User admin = aUser();
    when(userDataProvider.findById(ADMIN_ID)).thenReturn(Optional.of(admin));

    assertThatThrownBy(() -> useCase.execute(ADMIN_ID, false, ADMIN_ID))
        .isInstanceOf(SelfActionNotAllowedException.class);

    assertThat(admin.isActive()).isTrue();
    verify(userDataProvider, never()).saveUser(any());
  }

  @Test
  void throwsWhenTheUserDoesNotExist() {
    when(userDataProvider.findById(99)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> useCase.execute(99, false, ADMIN_ID))
        .isInstanceOf(ResourceNotFoundException.class);
  }
}
