package org.amicats.backend.domain.usecase.user.photo;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.util.Optional;
import javax.imageio.ImageIO;
import org.amicats.backend.domain.entity.User;
import org.amicats.backend.domain.enums.AccessType;
import org.amicats.backend.domain.interfaces.dataprovider.user.UserDataProvider;
import org.amicats.backend.domain.interfaces.storage.PhotoStorage;
import org.amicats.backend.domain.usecase.user.read.ReadUserOutput;
import org.amicats.backend.exception.InvalidPhotoException;
import org.amicats.backend.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class UserPhotoUseCaseTest {

  private static final Integer USER_ID = 2;
  private static final String KEY = "users/2/avatar.jpg";

  @Mock private UserDataProvider userDataProvider;
  @Mock private PhotoStorage photoStorage;

  private UserPhotoUseCase useCase;

  @BeforeEach
  void setUp() {
    useCase =
        UserPhotoUseCase.builder()
            .userDataProvider(userDataProvider)
            .photoStorage(photoStorage)
            .build();
  }

  @Test
  void storesTheNormalizedPhotoAndMarksTheUserAsHavingOne() {
    User user = aUser();
    when(userDataProvider.findById(USER_ID)).thenReturn(Optional.of(user));

    ReadUserOutput output = useCase.upload(USER_ID, png(300, 200));

    verify(photoStorage).save(eq(KEY), any(byte[].class));
    verify(userDataProvider).saveUser(user);
    assertThat(output.imageUrl()).isEqualTo("/users/2/photo");
  }

  @Test
  void rejectsAnInvalidFileWithoutTouchingStorageOrTheUser() {
    when(userDataProvider.findById(USER_ID)).thenReturn(Optional.of(aUser()));

    assertThatThrownBy(() -> useCase.upload(USER_ID, "texto".getBytes(StandardCharsets.UTF_8)))
        .isInstanceOf(InvalidPhotoException.class);

    verify(photoStorage, never()).save(any(), any());
    verify(userDataProvider, never()).saveUser(any());
  }

  @Test
  void readsThePhotoFromStorageIgnoringWhateverIsInTheColumn() {
    User user = aUser();
    user.changeImage("../../etc/passwd");
    byte[] bytes = {1, 2, 3};
    when(userDataProvider.findById(USER_ID)).thenReturn(Optional.of(user));
    when(photoStorage.load(KEY)).thenReturn(Optional.of(bytes));

    assertThat(useCase.read(USER_ID)).isEqualTo(bytes);
  }

  @Test
  void readThrowsNotFoundWhenThereIsNoPhoto() {
    when(userDataProvider.findById(USER_ID)).thenReturn(Optional.of(aUser()));

    assertThatThrownBy(() -> useCase.read(USER_ID)).isInstanceOf(ResourceNotFoundException.class);
  }

  @Test
  void removeClearsTheReferenceAndDeletesTheFile() {
    User user = aUser();
    user.changeImage(KEY);
    when(userDataProvider.findById(USER_ID)).thenReturn(Optional.of(user));

    useCase.remove(USER_ID);

    assertThat(user.getImageUrl()).isNull();
    verify(userDataProvider).saveUser(user);
    verify(photoStorage).delete(KEY);
  }

  private static User aUser() {
    User user = new User("Rafael", null, null, AccessType.Assistant, null, null, null);
    ReflectionTestUtils.setField(user, "id", USER_ID);
    return user;
  }

  private static byte[] png(int width, int height) {
    try {
      ByteArrayOutputStream out = new ByteArrayOutputStream();
      ImageIO.write(new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB), "png", out);
      return out.toByteArray();
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }
}
