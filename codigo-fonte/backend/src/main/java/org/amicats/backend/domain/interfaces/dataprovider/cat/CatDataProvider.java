package org.amicats.backend.domain.interfaces.dataprovider.cat;

import java.util.Optional;
import org.amicats.backend.domain.entity.Cat;
import org.amicats.backend.domain.usecase.cat.read.CatSearchCriteria;
import org.amicats.backend.domain.usecase.common.PagedResult;

public interface CatDataProvider {

  Cat saveCat(Cat cat);

  Optional<Cat> findById(Integer id);

  PagedResult<Cat> search(CatSearchCriteria criteria);
}
