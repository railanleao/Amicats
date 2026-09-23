package org.amicats.backend.repository.cat;

import java.util.Optional;
import org.amicats.backend.domain.entity.Cat;
import org.amicats.backend.domain.enums.GeneralStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CatRepository extends JpaRepository<Cat, Integer> {

  @Query("select c from Cat c left join fetch c.room where c.id = :id")
  Optional<Cat> findByIdFetchingRoom(@Param("id") Integer id);

  @Query(
      "select c from Cat c left join fetch c.room where "
          + "(:searchPattern is null or lower(c.name) like :searchPattern) "
          + "and (:roomId is null or c.room.id = :roomId) "
          + "and c.generalStatus = coalesce(:generalStatus, c.generalStatus)")
  Page<Cat> search(
      @Param("searchPattern") String searchPattern,
      @Param("roomId") Integer roomId,
      @Param("generalStatus") GeneralStatus generalStatus,
      Pageable pageable);
}
