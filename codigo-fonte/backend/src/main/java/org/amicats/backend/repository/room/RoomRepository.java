package org.amicats.backend.repository.room;

import org.amicats.backend.domain.entity.Room;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RoomRepository extends JpaRepository<Room, Integer> {

  @Query(
      "select r from Room r where "
          + "(:searchPattern is null or lower(r.title) like :searchPattern) "
          + "and r.active = coalesce(:active, r.active)")
  Page<Room> search(
      @Param("searchPattern") String searchPattern,
      @Param("active") Boolean active,
      Pageable pageable);
}
