package org.amicats.backend.domain.interfaces.dataprovider.user;

import java.util.List;
import java.util.Optional;
import org.amicats.backend.domain.entity.User;
import org.amicats.backend.domain.entity.UserAuth;

public interface UserDataProvider {

    boolean existsByEmail(String email);

    User saveUser(User user);

    UserAuth saveUserAuth(UserAuth userAuth);

    Optional<User> findById(Integer id);

    List<User> findAll();

    Optional<String> findEmailByUserId(Integer userId);
}