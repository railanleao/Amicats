package org.amicats.backend.domain.usecase.doseadministration.register;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;
import org.amicats.backend.domain.enums.DoseRegistrationOrigin;
import org.junit.jupiter.api.Test;

class RegisterDoseAdministrationInputTest {

  @Test
  void normalizesBlankNotesAndTimestampPrecision() {
    var input =
        new RegisterDoseAdministrationInput(
            UUID.fromString("6406ca75-0bdc-4ffc-a60b-c73cb136a5d8"),
            LocalDateTime.of(2026, 10, 5, 12, 0).withNano(123456789),
            "  ",
            DoseRegistrationOrigin.OfflineSynced,
            BigDecimal.ONE,
            " ML ");

    assertThat(input.consumedUnit()).isEqualTo("ml");
    assertThat(input.notes()).isNull();
    assertThat(input.administeredAt().getNano()).isEqualTo(123456000);
  }
}
