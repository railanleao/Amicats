package org.amicats.backend.domain.usecase.user.common;

import java.util.Locale;
import org.amicats.backend.domain.enums.AccessType;

public final class CrmvRule {

  private CrmvRule() {}

  public static boolean isSatisfiedBy(AccessType accessType, String crmv, String ufCrmv) {
    return accessType != AccessType.Veterinarian || (hasText(crmv) && hasText(ufCrmv));
  }

  public static String normalizeUf(String ufCrmv) {
    return ufCrmv == null ? null : ufCrmv.toUpperCase(Locale.ROOT);
  }

  public static String blankToNull(String value) {
    return hasText(value) ? value.trim() : null;
  }

  private static boolean hasText(String value) {
    return value != null && !value.isBlank();
  }
}
