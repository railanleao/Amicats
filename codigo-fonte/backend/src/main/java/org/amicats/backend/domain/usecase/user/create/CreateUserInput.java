package org.amicats.backend.domain.usecase.user.create;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.amicats.backend.domain.enums.AccessType;
import org.amicats.backend.domain.usecase.user.common.CrmvRule;

public record CreateUserInput(
    @NotBlank @Size(max = 150) String fullName,
    @NotBlank @Email @Size(max = 150) String email,
    @Size(max = 20) String phoneNumber,
    @NotNull AccessType accessType,
    @Size(max = 20) String crmv,
    @Pattern(regexp = "[A-Za-z]{2}") String ufCrmv) {

  @AssertTrue(message = "CRMV e UF são obrigatórios para veterinários.")
  public boolean isCrmvRequirementMet() {
    return CrmvRule.isSatisfiedBy(accessType, crmv, ufCrmv);
  }
}
