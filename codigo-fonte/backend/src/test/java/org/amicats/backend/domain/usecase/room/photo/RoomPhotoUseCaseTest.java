package org.amicats.backend.domain.usecase.room.photo;

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
import org.amicats.backend.domain.entity.Room;
import org.amicats.backend.domain.interfaces.dataprovider.room.RoomDataProvider;
import org.amicats.backend.domain.interfaces.storage.PhotoStorage;
import org.amicats.backend.domain.usecase.room.read.ReadRoomOutput;
import org.amicats.backend.exception.InvalidPhotoException;
import org.amicats.backend.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@ExtendWith(MockitoExtension.class)
class RoomPhotoUseCaseTest {

  private static final Integer ROOM_ID = 2;
  private static final String KEY = "rooms/2/cover.jpg";

  @Mock private RoomDataProvider roomDataProvider;
  @Mock private PhotoStorage photoStorage;

  private RoomPhotoUseCase useCase;

  @BeforeEach
  void setUp() {
    useCase =
        RoomPhotoUseCase.builder()
            .roomDataProvider(roomDataProvider)
            .photoStorage(photoStorage)
            .build();
  }

  @Test
  void storesTheNormalizedPhotoAndMarksTheRoomAsHavingOne() {
    Room room = aRoom();
    when(roomDataProvider.findById(ROOM_ID)).thenReturn(Optional.of(room));

    ReadRoomOutput output = useCase.upload(ROOM_ID, png(300, 200));

    verify(photoStorage).save(eq(KEY), any(byte[].class));
    verify(roomDataProvider).saveRoom(room);
    assertThat(output.coverImageUrl()).isEqualTo("/rooms/2/photo");
  }

  @Test
  void rejectsAnInvalidFileWithoutTouchingStorageOrTheRoom() {
    when(roomDataProvider.findById(ROOM_ID)).thenReturn(Optional.of(aRoom()));

    assertThatThrownBy(() -> useCase.upload(ROOM_ID, "texto".getBytes(StandardCharsets.UTF_8)))
        .isInstanceOf(InvalidPhotoException.class);

    verify(photoStorage, never()).save(any(), any());
    verify(roomDataProvider, never()).saveRoom(any());
  }

  @Test
  void readsThePhotoFromStorageIgnoringWhateverIsInTheColumn() {
    Room room = aRoom();
    room.changeImage("../../etc/passwd");
    byte[] bytes = {1, 2, 3};
    when(roomDataProvider.findById(ROOM_ID)).thenReturn(Optional.of(room));
    when(photoStorage.load(KEY)).thenReturn(Optional.of(bytes));

    assertThat(useCase.read(ROOM_ID)).isEqualTo(bytes);
  }

  @Test
  void readThrowsNotFoundWhenThereIsNoPhoto() {
    when(roomDataProvider.findById(ROOM_ID)).thenReturn(Optional.of(aRoom()));

    assertThatThrownBy(() -> useCase.read(ROOM_ID)).isInstanceOf(ResourceNotFoundException.class);
  }

  @Test
  void removeClearsTheReferenceAndDeletesTheFile() {
    Room room = aRoom();
    room.changeImage(KEY);
    when(roomDataProvider.findById(ROOM_ID)).thenReturn(Optional.of(room));

    useCase.remove(ROOM_ID);

    assertThat(room.getCoverImageUrl()).isNull();
    verify(roomDataProvider).saveRoom(room);
    verify(photoStorage).delete(KEY);
  }

  @Test
  void removeOnlyDeletesTheFileAfterTheTransactionCommits() {
    Room room = aRoom();
    room.changeImage(KEY);
    when(roomDataProvider.findById(ROOM_ID)).thenReturn(Optional.of(room));
    TransactionSynchronizationManager.initSynchronization();
    try {
      useCase.remove(ROOM_ID);

      verify(photoStorage, never()).delete(any());

      TransactionSynchronizationManager.getSynchronizations()
          .forEach(TransactionSynchronization::afterCommit);
      verify(photoStorage).delete(KEY);
    } finally {
      TransactionSynchronizationManager.clearSynchronization();
    }
  }

  private static Room aRoom() {
    Room room = new Room("Sala Azul", null, null, null);
    ReflectionTestUtils.setField(room, "id", ROOM_ID);
    return room;
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
