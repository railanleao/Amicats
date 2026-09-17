package org.amicats.backend.repository.user;

import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.amicats.backend.domain.entity.User;
import org.amicats.backend.domain.entity.UserAuth;
import org.amicats.backend.domain.interfaces.dataprovider.user.UserDataProvider;
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
    public List<User> findAll() {
        return userRepository.findAll();
    }

    @Override
    public Optional<String> findEmailByUserId(Integer userId) {
        return userAuthRepository.findEmailByUserId(userId);
    }
}