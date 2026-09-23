package org.amicats.backend.repository.cat;

import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.amicats.backend.domain.entity.Cat;
import org.amicats.backend.domain.entity.CatPhoto;
import org.amicats.backend.domain.interfaces.dataprovider.cat.CatDataProvider;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CatDataProviderImpl implements CatDataProvider {

  private final CatRepository catRepository;
  private final CatPhotoRepository catPhotoRepository;

  @Override
  public Cat saveCat(Cat cat) {
    return catRepository.save(cat);
  }

  @Override
  public Optional<Cat> findById(Integer id) {
    return catRepository.findById(id);
  }

  @Override
  public CatPhoto savePhoto(CatPhoto photo) {
    return catPhotoRepository.save(photo);
  }

  @Override
  public List<CatPhoto> findPhotosByCatId(Integer catId) {
    return catPhotoRepository.findByCatIdOrderByIdAsc(catId);
  }

  @Override
  public int countPhotosByCatId(Integer catId) {
    return catPhotoRepository.countByCatId(catId);
  }
}
