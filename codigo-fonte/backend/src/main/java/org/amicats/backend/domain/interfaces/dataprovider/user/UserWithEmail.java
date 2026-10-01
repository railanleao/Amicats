package org.amicats.backend.domain.interfaces.dataprovider.user;

import org.amicats.backend.domain.entity.User;

public record UserWithEmail(User user, String email) {}
