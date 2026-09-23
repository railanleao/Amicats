package org.amicats.backend.domain.interfaces.dataprovider.cat;

import java.util.List;
import java.util.Optional;
import org.amicats.backend.domain.entity.Cat;
import org.amicats.backend.domain.entity.CatPhoto;

public interface CatDataProvider {

  Cat saveCat(Cat cat);

  Optional<Cat> findById(Integer id);

  CatPhoto savePhoto(CatPhoto photo);

  List<CatPhoto> findPhotosByCatId(Integer catId);

  int countPhotosByCatId(Integer catId);
}
