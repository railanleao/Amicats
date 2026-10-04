package org.amicats.backend.domain.usecase.room.read;

import lombok.Builder;
import org.amicats.backend.domain.entity.Room;
import org.amicats.backend.domain.interfaces.dataprovider.room.RoomDataProvider;
import org.amicats.backend.domain.usecase.common.PagedResult;
import org.amicats.backend.exception.ResourceNotFoundException;
import org.springframework.transaction.annotation.Transactional;

@Builder
public class ReadRoomUseCase {

  private static final int MIN_PAGE_SIZE = 1;
  private static final int MAX_PAGE_SIZE = 100;
  private static final int DEFAULT_PAGE_SIZE = 20;

  private RoomDataProvider roomDataProvider;

  @Transactional(readOnly = true)
  public ReadRoomOutput findById(Integer id) {
    Room room =
        roomDataProvider
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Sala não encontrada: " + id));
    return ReadRoomOutput.from(room);
  }

  @Transactional(readOnly = true)
  public PagedResult<ReadRoomOutput> search(RoomSearchCriteria criteria) {
    RoomSearchCriteria sanitized = sanitize(criteria);

    PagedResult<Room> result = roomDataProvider.search(sanitized);

    return new PagedResult<>(
        result.content().stream().map(ReadRoomOutput::from).toList(),
        result.page(),
        result.size(),
        result.totalElements(),
        result.totalPages());
  }

  private RoomSearchCriteria sanitize(RoomSearchCriteria criteria) {
    int page = Math.max(criteria.page(), 0);
    int size =
        criteria.size() <= 0
            ? DEFAULT_PAGE_SIZE
            : Math.min(Math.max(criteria.size(), MIN_PAGE_SIZE), MAX_PAGE_SIZE);

    return new RoomSearchCriteria(criteria.search(), criteria.active(), page, size);
  }
}
