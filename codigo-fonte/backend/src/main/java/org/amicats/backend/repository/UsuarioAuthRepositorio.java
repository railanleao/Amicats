package org.amicats.backend.repository;

import java.util.Optional;

import org.amicats.backend.model.UserAuth;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UsuarioAuthRepositorio
        extends JpaRepository<UserAuth, Integer> {

    Optional<UserAuth> findByEmail(String email);
}
