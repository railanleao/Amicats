package org.amicats.backend.repository.user;

import org.amicats.backend.domain.entity.User;
import org.amicats.backend.domain.enums.AccessType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends JpaRepository<User, Integer> {

  @Query(
      "select u from User u where "
          + "(:searchPattern is null or lower(u.fullName) like :searchPattern "
          + "or exists (select 1 from UserAuth ua where ua.user = u and lower(ua.email) like :searchPattern)) "
          + "and u.accessType = coalesce(:accessType, u.accessType) "
          + "and u.active = coalesce(:active, u.active)")
  Page<User> search(
      @Param("searchPattern") String searchPattern,
      @Param("accessType") AccessType accessType,
      @Param("active") Boolean active,
      Pageable pageable);
}
