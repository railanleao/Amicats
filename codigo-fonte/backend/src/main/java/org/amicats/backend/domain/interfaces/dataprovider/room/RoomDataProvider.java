package org.amicats.backend.domain.interfaces.dataprovider.room;

import java.util.Optional;
import org.amicats.backend.domain.entity.Room;
import org.amicats.backend.domain.usecase.common.PagedResult;
import org.amicats.backend.domain.usecase.room.read.RoomSearchCriteria;

public interface RoomDataProvider {

  Room saveRoom(Room room);

  Optional<Room> findById(Integer id);

  PagedResult<Room> search(RoomSearchCriteria criteria);
}
