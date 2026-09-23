package org.amicats.backend.domain.usecase.cat.read;

import java.util.List;
import lombok.Builder;
import org.amicats.backend.domain.entity.Cat;
import org.amicats.backend.domain.entity.CatPhoto;
import org.amicats.backend.domain.interfaces.dataprovider.cat.CatDataProvider;
import org.amicats.backend.exception.ResourceNotFoundException;

@Builder
public class ReadCatUseCase {

  private CatDataProvider catDataProvider;

  public ReadCatOutput findById(Integer id) {
    Cat cat =
        catDataProvider
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Gato não encontrado: " + id));

    List<String> photoUrls =
        catDataProvider.findPhotosByCatId(id).stream()
            .map(CatPhoto::getId)
            .map(photoId -> "/cats/" + id + "/photos/" + photoId)
            .toList();

    return ReadCatOutput.from(cat, photoUrls);
  }
}
