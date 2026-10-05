package org.amicats.backend.domain.usecase.cat.photo;

import lombok.Builder;
import org.amicats.backend.domain.entity.Cat;
import org.amicats.backend.domain.interfaces.dataprovider.cat.CatDataProvider;
import org.amicats.backend.domain.interfaces.storage.PhotoStorage;
import org.amicats.backend.domain.usecase.cat.read.ReadCatOutput;
import org.amicats.backend.domain.usecase.common.photo.PhotoNormalizer;
import org.amicats.backend.exception.ResourceNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Builder
public class CatPhotoUseCase {

  private static final Logger log = LoggerFactory.getLogger(CatPhotoUseCase.class);

  private CatDataProvider catDataProvider;
  private PhotoStorage photoStorage;

  @Transactional
  public ReadCatOutput upload(Integer id, byte[] content) {
    Cat cat = find(id);
    byte[] normalized = PhotoNormalizer.normalize(content);

    String key = keyFor(id);
    photoStorage.save(key, normalized);
    cat.changeImage(key);
    catDataProvider.saveCat(cat);

    return ReadCatOutput.from(cat);
  }

  public byte[] read(Integer id) {
    Cat cat = find(id);
    if (cat.getPhotoUrl() == null) {
      throw new ResourceNotFoundException("Gato sem foto: " + id);
    }
    return photoStorage
        .load(keyFor(id))
        .orElseThrow(() -> new ResourceNotFoundException("Foto não encontrada: " + id));
  }

  @Transactional
  public void remove(Integer id) {
    Cat cat = find(id);
    boolean hadPhoto = cat.getPhotoUrl() != null;

    cat.removeImage();
    catDataProvider.saveCat(cat);

    if (hadPhoto) {
      deleteFileAfterCommit(keyFor(id));
    }
  }

  private void deleteFileAfterCommit(String key) {
    if (!TransactionSynchronizationManager.isSynchronizationActive()) {
      photoStorage.delete(key);
      return;
    }

    TransactionSynchronizationManager.registerSynchronization(
        new TransactionSynchronization() {
          @Override
          public void afterCommit() {
            try {
              photoStorage.delete(key);
            } catch (RuntimeException e) {
              log.warn("Não foi possível apagar a foto {} depois do commit.", key, e);
            }
          }
        });
  }

  private Cat find(Integer id) {
    return catDataProvider
        .findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Gato não encontrado: " + id));
  }

  private static String keyFor(Integer id) {
    return "cats/" + id + "/photo.jpg";
  }
}
