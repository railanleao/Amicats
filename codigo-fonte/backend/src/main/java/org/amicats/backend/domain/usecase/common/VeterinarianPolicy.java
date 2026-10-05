package org.amicats.backend.domain.usecase.common;

import org.amicats.backend.domain.entity.User;
import org.amicats.backend.domain.enums.AccessType;
import org.amicats.backend.domain.interfaces.dataprovider.user.UserDataProvider;
import org.amicats.backend.exception.VeterinarianRequiredException;

public final class VeterinarianPolicy {

  private VeterinarianPolicy() {}

  public static User requireVeterinarian(UserDataProvider userDataProvider, Integer userId) {
    User user =
        userDataProvider
            .findById(userId)
            .orElseThrow(() -> new VeterinarianRequiredException("Usuário não encontrado."));

    if (user.getAccessType() != AccessType.Veterinarian) {
      throw new VeterinarianRequiredException(
          "Apenas veterinários podem registrar prescrições médicas internas.");
    }

    if (user.getCrmv() == null || user.getCrmv().isBlank()) {
      throw new VeterinarianRequiredException(
          "Cadastre seu CRMV no perfil antes de registrar prescrições médicas.");
    }

    return user;
  }
}
