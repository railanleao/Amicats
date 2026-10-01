package org.amicats.backend.domain.usecase.cat.photo;

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
import org.amicats.backend.domain.entity.Cat;
import org.amicats.backend.domain.entity.User;
import org.amicats.backend.domain.enums.AccessType;
import org.amicats.backend.domain.enums.GeneralStatus;
import org.amicats.backend.domain.interfaces.dataprovider.cat.CatDataProvider;
import org.amicats.backend.domain.interfaces.storage.PhotoStorage;
import org.amicats.backend.domain.usecase.cat.read.ReadCatOutput;
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
class CatPhotoUseCaseTest {

  private static final Integer CAT_ID = 2;
  private static final String KEY = "cats/2/photo.jpg";

  @Mock private CatDataProvider catDataProvider;
  @Mock private PhotoStorage photoStorage;

  private CatPhotoUseCase useCase;

  @BeforeEach
  void setUp() {
    useCase =
        CatPhotoUseCase.builder()
            .catDataProvider(catDataProvider)
            .photoStorage(photoStorage)
            .build();
  }

  @Test
  void storesTheNormalizedPhotoAndMarksTheCatAsHavingOne() {
    Cat cat = aCat();
    when(catDataProvider.findById(CAT_ID)).thenReturn(Optional.of(cat));

    ReadCatOutput output = useCase.upload(CAT_ID, png(300, 200));

    verify(photoStorage).save(eq(KEY), any(byte[].class));
    verify(catDataProvider).saveCat(cat);
    assertThat(output.photoUrl()).isEqualTo("/cats/2/photo");
  }

  @Test
  void rejectsAnInvalidFileWithoutTouchingStorageOrTheCat() {
    when(catDataProvider.findById(CAT_ID)).thenReturn(Optional.of(aCat()));

    assertThatThrownBy(() -> useCase.upload(CAT_ID, "texto".getBytes(StandardCharsets.UTF_8)))
        .isInstanceOf(InvalidPhotoException.class);

    verify(photoStorage, never()).save(any(), any());
    verify(catDataProvider, never()).saveCat(any());
  }

  @Test
  void readsThePhotoFromStorageIgnoringWhateverIsInTheColumn() {
    Cat cat = aCat();
    cat.changeImage("../../etc/passwd");
    byte[] bytes = {1, 2, 3};
    when(catDataProvider.findById(CAT_ID)).thenReturn(Optional.of(cat));
    when(photoStorage.load(KEY)).thenReturn(Optional.of(bytes));

    assertThat(useCase.read(CAT_ID)).isEqualTo(bytes);
  }

  @Test
  void readThrowsNotFoundWhenThereIsNoPhoto() {
    when(catDataProvider.findById(CAT_ID)).thenReturn(Optional.of(aCat()));

    assertThatThrownBy(() -> useCase.read(CAT_ID)).isInstanceOf(ResourceNotFoundException.class);
  }

  @Test
  void removeClearsTheReferenceAndDeletesTheFile() {
    Cat cat = aCat();
    cat.changeImage(KEY);
    when(catDataProvider.findById(CAT_ID)).thenReturn(Optional.of(cat));

    useCase.remove(CAT_ID);

    assertThat(cat.getPhotoUrl()).isNull();
    verify(catDataProvider).saveCat(cat);
    verify(photoStorage).delete(KEY);
  }

  @Test
  void removeOnlyDeletesTheFileAfterTheTransactionCommits() {
    Cat cat = aCat();
    cat.changeImage(KEY);
    when(catDataProvider.findById(CAT_ID)).thenReturn(Optional.of(cat));
    TransactionSynchronizationManager.initSynchronization();
    try {
      useCase.remove(CAT_ID);

      verify(photoStorage, never()).delete(any());

      TransactionSynchronizationManager.getSynchronizations()
          .forEach(TransactionSynchronization::afterCommit);
      verify(photoStorage).delete(KEY);
    } finally {
      TransactionSynchronizationManager.clearSynchronization();
    }
  }

  private static Cat aCat() {
    User creator = new User("Rafael", null, null, AccessType.Assistant, null, null, null);
    Cat cat =
        new Cat(
            "Nina",
            null,
            null,
            null,
            null,
            null,
            null,
            GeneralStatus.InClinic,
            null,
            null,
            null,
            null,
            null,
            null,
            creator);
    ReflectionTestUtils.setField(cat, "id", CAT_ID);
    return cat;
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
