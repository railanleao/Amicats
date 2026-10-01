package org.amicats.backend.domain.interfaces.dataprovider.user;

import java.util.Optional;
import org.amicats.backend.domain.entity.User;
import org.amicats.backend.domain.entity.UserAuth;
import org.amicats.backend.domain.usecase.common.PagedResult;
import org.amicats.backend.domain.usecase.user.read.UserSearchCriteria;

public interface UserDataProvider {

  boolean existsByEmail(String email);

  User saveUser(User user);

  UserAuth saveUserAuth(UserAuth userAuth);

  Optional<User> findById(Integer id);

  PagedResult<UserWithEmail> search(UserSearchCriteria criteria);

  Optional<String> findEmailByUserId(Integer userId);
}
