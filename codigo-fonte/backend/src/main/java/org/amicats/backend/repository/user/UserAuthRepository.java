package org.amicats.backend.repository.user;

import java.util.Optional;

import org.amicats.backend.domain.entity.UserAuth;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserAuthRepository
        extends JpaRepository<UserAuth, Integer> {

    Optional<UserAuth> findByEmail(String email);
}
