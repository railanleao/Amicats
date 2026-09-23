package org.amicats.backend.domain.usecase.user.photo;

import lombok.Builder;
import org.amicats.backend.domain.entity.User;
import org.amicats.backend.domain.interfaces.dataprovider.user.UserDataProvider;
import org.amicats.backend.domain.interfaces.storage.PhotoStorage;
import org.amicats.backend.domain.usecase.common.photo.PhotoNormalizer;
import org.amicats.backend.domain.usecase.user.read.ReadUserOutput;
import org.amicats.backend.exception.ResourceNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Builder
public class UserPhotoUseCase {

  private static final Logger log = LoggerFactory.getLogger(UserPhotoUseCase.class);

  private UserDataProvider userDataProvider;
  private PhotoStorage photoStorage;

  @Transactional
  public ReadUserOutput upload(Integer id, byte[] content) {
    User user = find(id);
    byte[] normalized = PhotoNormalizer.normalize(content);

    String key = keyFor(id);
    photoStorage.save(key, normalized);
    user.changeImage(key);
    userDataProvider.saveUser(user);

    String email = userDataProvider.findEmailByUserId(id).orElse(null);
    return ReadUserOutput.from(user, email);
  }

  public byte[] read(Integer id) {
    User user = find(id);
    if (user.getImageUrl() == null) {
      throw new ResourceNotFoundException("Usuário sem foto: " + id);
    }
    return photoStorage
        .load(keyFor(id))
        .orElseThrow(() -> new ResourceNotFoundException("Foto não encontrada: " + id));
  }

  @Transactional
  public void remove(Integer id) {
    User user = find(id);
    boolean hadPhoto = user.getImageUrl() != null;

    user.removeImage();
    userDataProvider.saveUser(user);

    if (hadPhoto) {
      deleteFileAfterCommit(keyFor(id));
    }
  }

  // The file only disappears once the database change is durable: if the commit fails, the
  // photo is still there and the reference in the database stays valid. An orphan file left by a
  // failed delete is harmless, since the key is fixed per user and the next upload overwrites it.
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

  private User find(Integer id) {
    return userDataProvider
        .findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado: " + id));
  }

  private static String keyFor(Integer id) {
    return "users/" + id + "/avatar.jpg";
  }
}
