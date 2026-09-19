package org.amicats.backend.repository.user;

import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.amicats.backend.domain.entity.User;
import org.amicats.backend.domain.entity.UserAuth;
import org.amicats.backend.domain.interfaces.dataprovider.user.UserDataProvider;
import org.amicats.backend.domain.interfaces.dataprovider.user.UserWithEmail;
import org.amicats.backend.domain.usecase.common.PagedResult;
import org.amicats.backend.domain.usecase.user.read.UserSearchCriteria;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class UserDataProviderImpl implements UserDataProvider {

  private final UserRepository userRepository;
  private final UserAuthRepository userAuthRepository;

  @Override
  public boolean existsByEmail(String email) {
    return userAuthRepository.findByEmail(email).isPresent();
  }

  @Override
  public User saveUser(User user) {
    return userRepository.save(user);
  }

  @Override
  public UserAuth saveUserAuth(UserAuth userAuth) {
    return userAuthRepository.save(userAuth);
  }

  @Override
  public Optional<User> findById(Integer id) {
    return userRepository.findById(id);
  }

  @Override
  public PagedResult<UserWithEmail> search(UserSearchCriteria criteria) {
    String searchPattern = toSearchPattern(criteria.search());
    Pageable pageable = PageRequest.of(criteria.page(), criteria.size(), Sort.by("fullName"));

    Page<User> page =
        userRepository.search(searchPattern, criteria.accessType(), criteria.active(), pageable);

    List<UserWithEmail> content =
        page.getContent().stream()
            .map(user -> new UserWithEmail(user, findEmailByUserId(user.getId()).orElse(null)))
            .toList();

    return new PagedResult<>(
        content, page.getNumber(), page.getSize(), page.getTotalElements(), page.getTotalPages());
  }

  @Override
  public Optional<String> findEmailByUserId(Integer userId) {
    return userAuthRepository.findEmailByUserId(userId);
  }

  private String toSearchPattern(String search) {
    if (search == null || search.isBlank()) {
      return null;
    }
    return "%" + search.trim().toLowerCase() + "%";
  }
}
