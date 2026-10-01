package org.amicats.backend.domain.usecase.user;

import static org.assertj.core.api.Assertions.assertThat;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.amicats.backend.domain.enums.AccessType;
import org.amicats.backend.domain.usecase.user.create.CreateUserInput;
import org.amicats.backend.domain.usecase.user.update.UpdateUserInput;
import org.junit.jupiter.api.Test;

class CrmvRequirementValidationTest {

  private static final String MESSAGE = "CRMV e UF são obrigatórios para veterinários.";
  private static final Validator VALIDATOR =
      Validation.buildDefaultValidatorFactory().getValidator();

  @Test
  void updateRejectsAVeterinarianWithoutCrmv() {
    UpdateUserInput input =
        new UpdateUserInput("Rafael", null, AccessType.Veterinarian, null, null);

    assertThat(VALIDATOR.validate(input))
        .extracting(ConstraintViolation::getMessage)
        .contains(MESSAGE);
  }

  @Test
  void updateAcceptsAVeterinarianWithCrmvAndUf() {
    UpdateUserInput input =
        new UpdateUserInput("Rafael", null, AccessType.Veterinarian, "12345", "MS");

    assertThat(VALIDATOR.validate(input)).isEmpty();
  }

  @Test
  void updateDoesNotRequireCrmvForOtherAccessTypes() {
    UpdateUserInput input = new UpdateUserInput("Rafael", null, AccessType.Assistant, null, null);

    assertThat(VALIDATOR.validate(input)).isEmpty();
  }

  @Test
  void createRejectsAVeterinarianWithoutUf() {
    CreateUserInput input =
        new CreateUserInput(
            "Rafael", "rafael@amicats.org.br", null, AccessType.Veterinarian, "12345", null);

    assertThat(VALIDATOR.validate(input))
        .extracting(ConstraintViolation::getMessage)
        .contains(MESSAGE);
  }

  @Test
  void createAcceptsANonVeterinarianWithoutCrmv() {
    CreateUserInput input =
        new CreateUserInput("Rafael", "rafael@amicats.org.br", null, AccessType.Viewer, null, null);

    assertThat(VALIDATOR.validate(input)).isEmpty();
  }

  @Test
  void createRejectsAnInvalidEmail() {
    CreateUserInput input =
        new CreateUserInput("Rafael", "sem-arroba", null, AccessType.Viewer, null, null);

    assertThat(VALIDATOR.validate(input)).isNotEmpty();
  }

  @Test
  void blankOptionalFieldsAreAcceptedForNonVeterinarians() {
    UpdateUserInput input = new UpdateUserInput("Rafael", "", AccessType.Assistant, "", "");

    assertThat(VALIDATOR.validate(input)).isEmpty();
  }

  @Test
  void blankCrmvAndUfStillFailForVeterinarians() {
    UpdateUserInput input = new UpdateUserInput("Rafael", null, AccessType.Veterinarian, "", "");

    assertThat(VALIDATOR.validate(input))
        .extracting(ConstraintViolation::getMessage)
        .contains(MESSAGE);
  }
}
