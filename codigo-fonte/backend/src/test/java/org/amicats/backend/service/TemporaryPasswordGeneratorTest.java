package org.amicats.backend.service;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.HashSet;
import java.util.Set;
import org.junit.jupiter.api.Test;

class TemporaryPasswordGeneratorTest {

  private final TemporaryPasswordGenerator generator = new TemporaryPasswordGenerator();

  @Test
  void generatesAPasswordWithTheExpectedLength() {
    assertThat(generator.generate()).hasSize(12);
  }

  @Test
  void generatesAPasswordMixingUppercaseLowercaseDigitsAndSymbols() {
    String password = generator.generate();

    assertThat(password).containsPattern("[A-Z]");
    assertThat(password).containsPattern("[a-z]");
    assertThat(password).containsPattern("[0-9]");
    assertThat(password).containsPattern("[!@#$%&*+\\-=?]");
  }

  @Test
  void generatesDifferentPasswordsAcrossCalls() {
    Set<String> generated = new HashSet<>();
    for (int i = 0; i < 50; i++) {
      generated.add(generator.generate());
    }

    assertThat(generated).hasSize(50);
  }
}
