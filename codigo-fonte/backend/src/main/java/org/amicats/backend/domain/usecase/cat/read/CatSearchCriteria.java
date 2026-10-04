package org.amicats.backend.domain.usecase.cat.read;

import org.amicats.backend.domain.enums.GeneralStatus;

public record CatSearchCriteria(
    String search, Integer roomId, GeneralStatus generalStatus, int page, int size) {}
