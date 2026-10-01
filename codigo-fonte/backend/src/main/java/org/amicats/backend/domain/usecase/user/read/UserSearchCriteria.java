package org.amicats.backend.domain.usecase.user.read;

import org.amicats.backend.domain.enums.AccessType;

public record UserSearchCriteria(
    String search, AccessType accessType, Boolean active, int page, int size) {}
