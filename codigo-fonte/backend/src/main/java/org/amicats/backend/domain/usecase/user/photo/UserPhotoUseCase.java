package org.amicats.backend.domain.usecase.user.photo;

import lombok.Builder;
import org.amicats.backend.domain.entity.User;
import org.amicats.backend.domain.interfaces.dataprovider.user.UserDataProvider;
import org.amicats.backend.domain.interfaces.storage.PhotoStorage;
import org.amicats.backend.domain.usecase.user.read.ReadUserOutput;
import org.amicats.backend.exception.ResourceNotFoundException;
import org.springframework.transaction.annotation.Transactional;

@Builder
public class UserPhotoUseCase {

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
      photoStorage.delete(keyFor(id));
    }
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
