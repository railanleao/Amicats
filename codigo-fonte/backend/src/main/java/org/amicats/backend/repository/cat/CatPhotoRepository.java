package org.amicats.backend.repository.cat;

import java.util.List;
import org.amicats.backend.domain.entity.CatPhoto;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CatPhotoRepository extends JpaRepository<CatPhoto, Integer> {

  // Ordered by id, not position: two photos for the same cat can be uploaded concurrently (the
  // mobile and web clients both fire all of a cat's uploads in parallel), and position is computed
  // from a plain count-then-insert in CatPhotoUseCase, which isn't atomic — concurrent uploads can
  // race and land on the same position. The auto-increment id has no such race, so it's the only
  // ordering that's actually reliable here.
  List<CatPhoto> findByCatIdOrderByIdAsc(Integer catId);

  int countByCatId(Integer catId);
}
