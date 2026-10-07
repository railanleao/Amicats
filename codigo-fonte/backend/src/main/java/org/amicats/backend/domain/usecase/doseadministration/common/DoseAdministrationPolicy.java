package org.amicats.backend.domain.usecase.doseadministration.common;

import java.util.Set;
import org.amicats.backend.domain.entity.User;
import org.amicats.backend.domain.enums.AccessType;
import org.amicats.backend.domain.interfaces.dataprovider.user.UserDataProvider;
import org.amicats.backend.exception.DoseAdministrationAccessException;

public final class DoseAdministrationPolicy {
  private static final Set<AccessType> WRITERS =
      Set.of(AccessType.Administrator, AccessType.Veterinarian, AccessType.Assistant);

  private DoseAdministrationPolicy() {}

  public static User requireActive(UserDataProvider users, Integer userId) {
    User user = users.findById(userId).orElseThrow(
        () -> new DoseAdministrationAccessException("Usuário não autorizado."));
    if (!user.isActive()) {
      throw new DoseAdministrationAccessException("Usuário inativo.");
    }
    return user;
  }

  public static User requireWriter(UserDataProvider users, Integer userId) {
    User user = requireActive(users, userId);
    if (user.getAccessType() == null || !WRITERS.contains(user.getAccessType())) {
      throw new DoseAdministrationAccessException("Perfil sem permissão para registrar doses.");
    }
    return user;
  }
}