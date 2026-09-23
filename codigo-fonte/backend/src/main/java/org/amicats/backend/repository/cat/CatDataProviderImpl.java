package org.amicats.backend.repository.cat;

import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.amicats.backend.domain.entity.Cat;
import org.amicats.backend.domain.interfaces.dataprovider.cat.CatDataProvider;
import org.amicats.backend.domain.usecase.cat.read.CatSearchCriteria;
import org.amicats.backend.domain.usecase.common.PagedResult;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CatDataProviderImpl implements CatDataProvider {

  private final CatRepository catRepository;

  @Override
  public Cat saveCat(Cat cat) {
    return catRepository.save(cat);
  }

  @Override
  public Optional<Cat> findById(Integer id) {
    return catRepository.findByIdFetchingRoom(id);
  }

  @Override
  public PagedResult<Cat> search(CatSearchCriteria criteria) {
    String searchPattern = toSearchPattern(criteria.search());
    Pageable pageable = PageRequest.of(criteria.page(), criteria.size(), Sort.by("name"));

    Page<Cat> page =
        catRepository.search(searchPattern, criteria.roomId(), criteria.generalStatus(), pageable);

    return new PagedResult<>(
        page.getContent(),
        page.getNumber(),
        page.getSize(),
        page.getTotalElements(),
        page.getTotalPages());
  }

  private String toSearchPattern(String search) {
    if (search == null || search.isBlank()) {
      return null;
    }
    return "%" + search.trim().toLowerCase() + "%";
  }
}
