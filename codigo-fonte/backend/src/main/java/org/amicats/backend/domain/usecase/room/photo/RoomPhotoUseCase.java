package org.amicats.backend.domain.usecase.room.photo;

import lombok.Builder;
import org.amicats.backend.domain.entity.Room;
import org.amicats.backend.domain.interfaces.dataprovider.room.RoomDataProvider;
import org.amicats.backend.domain.interfaces.storage.PhotoStorage;
import org.amicats.backend.domain.usecase.common.photo.PhotoNormalizer;
import org.amicats.backend.domain.usecase.room.read.ReadRoomOutput;
import org.amicats.backend.exception.ResourceNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Builder
public class RoomPhotoUseCase {

  private static final Logger log = LoggerFactory.getLogger(RoomPhotoUseCase.class);

  private RoomDataProvider roomDataProvider;
  private PhotoStorage photoStorage;

  @Transactional
  public ReadRoomOutput upload(Integer id, byte[] content) {
    Room room = find(id);
    byte[] normalized = PhotoNormalizer.normalize(content);

    String key = keyFor(id);
    photoStorage.save(key, normalized);
    room.changeImage(key);
    roomDataProvider.saveRoom(room);

    return ReadRoomOutput.from(room);
  }

  public byte[] read(Integer id) {
    Room room = find(id);
    if (room.getCoverImageUrl() == null) {
      throw new ResourceNotFoundException("Sala sem foto: " + id);
    }
    return photoStorage
        .load(keyFor(id))
        .orElseThrow(() -> new ResourceNotFoundException("Foto não encontrada: " + id));
  }

  @Transactional
  public void remove(Integer id) {
    Room room = find(id);
    boolean hadPhoto = room.getCoverImageUrl() != null;

    room.removeImage();
    roomDataProvider.saveRoom(room);

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

  private Room find(Integer id) {
    return roomDataProvider
        .findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Sala não encontrada: " + id));
  }

  private static String keyFor(Integer id) {
    return "rooms/" + id + "/cover.jpg";
  }
}
