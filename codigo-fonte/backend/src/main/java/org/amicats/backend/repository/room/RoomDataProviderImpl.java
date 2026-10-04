package org.amicats.backend.repository.room;

import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.amicats.backend.domain.entity.Room;
import org.amicats.backend.domain.interfaces.dataprovider.room.RoomDataProvider;
import org.amicats.backend.domain.usecase.common.PagedResult;
import org.amicats.backend.domain.usecase.room.read.RoomSearchCriteria;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RoomDataProviderImpl implements RoomDataProvider {

  private final RoomRepository roomRepository;

  @Override
  public Room saveRoom(Room room) {
    return roomRepository.save(room);
  }

  @Override
  public Optional<Room> findById(Integer id) {
    return roomRepository.findById(id);
  }

  @Override
  public PagedResult<Room> search(RoomSearchCriteria criteria) {
    String searchPattern = toSearchPattern(criteria.search());
    Pageable pageable = PageRequest.of(criteria.page(), criteria.size(), Sort.by("title"));

    Page<Room> page = roomRepository.search(searchPattern, criteria.active(), pageable);

    return new PagedResult<>(
        page.getContent(),
        page.getNumber(),
        page.getSize(),
        page.getTotalElements(),
        page.getTotalPages());
  }

  private String toSearchPattern(String search) {
    if (search == null || search.isBlank()) {
      return null;
    }
    return "%" + search.trim().toLowerCase() + "%";
  }
}
