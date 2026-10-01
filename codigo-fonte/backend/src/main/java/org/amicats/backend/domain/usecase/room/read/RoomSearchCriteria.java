package org.amicats.backend.domain.usecase.room.read;

public record RoomSearchCriteria(String search, Boolean active, int page, int size) {}
