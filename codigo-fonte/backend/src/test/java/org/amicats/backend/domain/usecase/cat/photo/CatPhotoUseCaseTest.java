package org.amicats.backend.domain.usecase.cat.photo;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.util.List;
import java.util.Optional;
import javax.imageio.ImageIO;
import org.amicats.backend.domain.entity.Cat;
import org.amicats.backend.domain.entity.CatPhoto;
import org.amicats.backend.domain.interfaces.dataprovider.cat.CatDataProvider;
import org.amicats.backend.domain.interfaces.storage.PhotoStorage;
import org.amicats.backend.exception.InvalidPhotoException;
import org.amicats.backend.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class CatPhotoUseCaseTest {

  private static final Integer CAT_ID = 3;

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
  void storesTheNormalizedPhotoAppendedAtTheNextPosition() {
    when(catDataProvider.findById(CAT_ID)).thenReturn(Optional.of(aCat()));
    when(catDataProvider.countPhotosByCatId(CAT_ID)).thenReturn(2);
    when(catDataProvider.savePhoto(any())).thenAnswer(invocation -> invocation.getArgument(0));

    ReadCatPhotoOutput output = useCase.upload(CAT_ID, png(300, 200));

    verify(photoStorage).save(anyString(), any(byte[].class));
    assertThat(output.url()).startsWith("/cats/" + CAT_ID + "/photos/");
  }

  @Test
  void rejectsAUploadOnceTheCatAlreadyHasSixPhotos() {
    when(catDataProvider.findById(CAT_ID)).thenReturn(Optional.of(aCat()));
    when(catDataProvider.countPhotosByCatId(CAT_ID)).thenReturn(6);

    assertThatThrownBy(() -> useCase.upload(CAT_ID, png(300, 200)))
        .isInstanceOf(InvalidPhotoException.class);

    verify(photoStorage, never()).save(any(), any());
    verify(catDataProvider, never()).savePhoto(any());
  }

  @Test
  void uploadThrowsNotFoundForAnInexistentCat() {
    when(catDataProvider.findById(CAT_ID)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> useCase.upload(CAT_ID, png(300, 200)))
        .isInstanceOf(ResourceNotFoundException.class);
  }

  @Test
  void readsThePhotoMatchingTheGivenId() {
    CatPhoto photo = aPhoto(11, "cats/3/a.jpg");
    when(catDataProvider.findPhotosByCatId(CAT_ID)).thenReturn(List.of(photo));
    when(photoStorage.load("cats/3/a.jpg")).thenReturn(Optional.of(new byte[] {1, 2, 3}));

    assertThat(useCase.read(CAT_ID, 11)).containsExactly(1, 2, 3);
  }

  @Test
  void readThrowsNotFoundWhenThePhotoDoesNotBelongToTheCat() {
    when(catDataProvider.findPhotosByCatId(CAT_ID)).thenReturn(List.of());

    assertThatThrownBy(() -> useCase.read(CAT_ID, 999))
        .isInstanceOf(ResourceNotFoundException.class);
  }

  @Test
  void rejectsAnInvalidFileWithoutTouchingStorage() {
    when(catDataProvider.findById(CAT_ID)).thenReturn(Optional.of(aCat()));
    when(catDataProvider.countPhotosByCatId(CAT_ID)).thenReturn(0);

    assertThatThrownBy(() -> useCase.upload(CAT_ID, "texto".getBytes()))
        .isInstanceOf(InvalidPhotoException.class);

    verify(photoStorage, never()).save(any(), any());
    verify(catDataProvider, times(0)).savePhoto(any());
  }

  private static Cat aCat() {
    Cat cat =
        new Cat(
            "Mingau", null, null, null, null, null, null, null, null, null, null, null, null, null,
            null, null, null, null);
    ReflectionTestUtils.setField(cat, "id", CAT_ID);
    return cat;
  }

  private static CatPhoto aPhoto(int id, String key) {
    CatPhoto photo = new CatPhoto(aCat(), key, 0);
    ReflectionTestUtils.setField(photo, "id", id);
    return photo;
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
