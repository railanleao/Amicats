package org.amicats.backend.domain.usecase.user.read;

import lombok.Builder;
import org.amicats.backend.domain.entity.User;
import org.amicats.backend.domain.interfaces.dataprovider.user.UserDataProvider;
import org.amicats.backend.domain.interfaces.dataprovider.user.UserWithEmail;
import org.amicats.backend.domain.usecase.common.PagedResult;
import org.amicats.backend.exception.ResourceNotFoundException;
import org.springframework.transaction.annotation.Transactional;

@Builder
public class ReadUserUseCase {

  private static final int MIN_PAGE_SIZE = 1;
  private static final int MAX_PAGE_SIZE = 100;
  private static final int DEFAULT_PAGE_SIZE = 20;

  private UserDataProvider userDataProvider;

  @Transactional(readOnly = true)
  public ReadUserOutput findById(Integer id) {
    User user =
        userDataProvider
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado: " + id));
    String email = userDataProvider.findEmailByUserId(user.getId()).orElse(null);
    return ReadUserOutput.from(user, email);
  }

  @Transactional(readOnly = true)
  public PagedResult<ReadUserOutput> search(UserSearchCriteria criteria) {
    UserSearchCriteria sanitized = sanitize(criteria);

    PagedResult<UserWithEmail> result = userDataProvider.search(sanitized);

    return new PagedResult<>(
        result.content().stream()
            .map(pair -> ReadUserOutput.from(pair.user(), pair.email()))
            .toList(),
        result.page(),
        result.size(),
        result.totalElements(),
        result.totalPages());
  }

  private UserSearchCriteria sanitize(UserSearchCriteria criteria) {
    int page = Math.max(criteria.page(), 0);
    int size =
        criteria.size() <= 0
            ? DEFAULT_PAGE_SIZE
            : Math.min(Math.max(criteria.size(), MIN_PAGE_SIZE), MAX_PAGE_SIZE);

    return new UserSearchCriteria(
        criteria.search(), criteria.accessType(), criteria.active(), page, size);
  }
}
