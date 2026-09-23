package org.amicats.backend.domain.usecase.cat.photo;

import org.amicats.backend.domain.entity.CatPhoto;

public record ReadCatPhotoOutput(Integer id, String url) {

  public static ReadCatPhotoOutput from(CatPhoto photo) {
    return new ReadCatPhotoOutput(
        photo.getId(), "/cats/" + photo.getCat().getId() + "/photos/" + photo.getId());
  }
}
