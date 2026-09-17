package org.amicats.backend.domain.usecase.user.read;

import java.time.LocalDateTime;
import org.amicats.backend.domain.entity.User;
import org.amicats.backend.domain.enums.AccessType;

public record ReadUserOutput(
    Integer id,
    String fullName,
    String email,
    String phoneNumber,
    String imageUrl,
    AccessType accessType,
    String crmv,
    String ufCrmv,
    boolean active,
    LocalDateTime createdAt) {

  public static ReadUserOutput from(User user, String email) {
    return new ReadUserOutput(
        user.getId(),
        user.getFullName(),
        email,
        user.getPhoneNumber(),
        user.getImageUrl(),
        user.getAccessType(),
        user.getCrmv(),
        user.getUfCrmv(),
        user.isActive(),
        user.getCreatedAt());
  }
}
