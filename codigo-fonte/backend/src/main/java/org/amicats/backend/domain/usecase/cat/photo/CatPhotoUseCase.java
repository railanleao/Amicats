package org.amicats.backend.domain.usecase.cat.photo;

import java.util.UUID;
import lombok.Builder;
import org.amicats.backend.domain.entity.Cat;
import org.amicats.backend.domain.entity.CatPhoto;
import org.amicats.backend.domain.interfaces.dataprovider.cat.CatDataProvider;
import org.amicats.backend.domain.interfaces.storage.PhotoStorage;
import org.amicats.backend.domain.usecase.user.photo.PhotoNormalizer;
import org.amicats.backend.exception.InvalidPhotoException;
import org.amicats.backend.exception.ResourceNotFoundException;
import org.springframework.transaction.annotation.Transactional;

@Builder
public class CatPhotoUseCase {

  // Matches "até 6 fotos" on the Paper design for the "Novo gato" screen.
  private static final int MAX_PHOTOS_PER_CAT = 6;

  private CatDataProvider catDataProvider;
  private PhotoStorage photoStorage;

  // Both the mobile and web clients upload a cat's chosen photos in parallel (one request per
  // photo, fired together), so this method runs concurrently for the same cat. The count below is
  // therefore best-effort, not a hard guarantee: two uploads can both read the same count before
  // either commits, so (a) the max-photos check can occasionally let in one more than
  // MAX_PHOTOS_PER_CAT, and (b) `position` can collide between two photos. Neither is used for
  // anything load-bearing — display order comes from the id (CatPhotoRepository), which the
  // database itself guarantees is race-free. Worth revisiting with a DB-level lock or a unique
  // constraint if photo count/order ever becomes something users depend on precisely.
  @Transactional
  public ReadCatPhotoOutput upload(Integer catId, byte[] content) {
    Cat cat = find(catId);

    int existing = catDataProvider.countPhotosByCatId(catId);
    if (existing >= MAX_PHOTOS_PER_CAT) {
      throw new InvalidPhotoException(
          "Este gato já tem o máximo de " + MAX_PHOTOS_PER_CAT + " fotos.");
    }

    byte[] normalized = PhotoNormalizer.normalize(content);
    String key = "cats/" + catId + "/" + UUID.randomUUID() + ".jpg";
    photoStorage.save(key, normalized);

    CatPhoto photo = catDataProvider.savePhoto(new CatPhoto(cat, key, existing));
    return ReadCatPhotoOutput.from(photo);
  }

  public byte[] read(Integer catId, Integer photoId) {
    CatPhoto photo =
        catDataProvider.findPhotosByCatId(catId).stream()
            .filter(candidate -> candidate.getId().equals(photoId))
            .findFirst()
            .orElseThrow(() -> new ResourceNotFoundException("Foto não encontrada: " + photoId));

    return photoStorage
        .load(photo.getStorageKey())
        .orElseThrow(() -> new ResourceNotFoundException("Foto não encontrada: " + photoId));
  }

  private Cat find(Integer catId) {
    return catDataProvider
        .findById(catId)
        .orElseThrow(() -> new ResourceNotFoundException("Gato não encontrado: " + catId));
  }
}
