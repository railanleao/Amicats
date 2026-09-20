package org.amicats.backend.domain.usecase.common;

import java.util.List;

public record PagedResult<T>(
    List<T> content, int page, int size, long totalElements, int totalPages) {}
