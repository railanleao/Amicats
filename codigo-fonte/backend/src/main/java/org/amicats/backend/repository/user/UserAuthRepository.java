package org.amicats.backend.repository.user;

import java.util.Optional;
import org.amicats.backend.domain.entity.UserAuth;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface UserAuthRepository extends JpaRepository<UserAuth, Integer> {

  Optional<UserAuth> findByEmail(String email);

  Optional<UserAuth> findByUser_Id(Integer userId);

  @Query("select ua.email from UserAuth ua where ua.user.id = :userId")
  Optional<String> findEmailByUserId(@Param("userId") Integer userId);
}
