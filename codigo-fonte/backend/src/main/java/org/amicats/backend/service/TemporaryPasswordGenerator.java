package org.amicats.backend.service;

import java.security.SecureRandom;
import org.springframework.stereotype.Component;

@Component
public class TemporaryPasswordGenerator {

  private static final String UPPERCASE = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  private static final String LOWERCASE = "abcdefghijkmnpqrstuvwxyz";
  private static final String DIGITS = "23456789";
  private static final String SYMBOLS = "!@#$%&*+-=?";
  private static final String ALL_CHARACTERS = UPPERCASE + LOWERCASE + DIGITS + SYMBOLS;
  private static final int LENGTH = 12;

  private final SecureRandom secureRandom = new SecureRandom();

  public String generate() {

    char[] password = new char[LENGTH];

    password[0] = randomCharFrom(UPPERCASE);
    password[1] = randomCharFrom(LOWERCASE);
    password[2] = randomCharFrom(DIGITS);
    password[3] = randomCharFrom(SYMBOLS);

    for (int i = 4; i < LENGTH; i++) {
      password[i] = randomCharFrom(ALL_CHARACTERS);
    }

    shuffle(password);

    return new String(password);
  }

  private char randomCharFrom(String source) {
    return source.charAt(secureRandom.nextInt(source.length()));
  }

  private void shuffle(char[] password) {
    for (int i = password.length - 1; i > 0; i--) {
      int j = secureRandom.nextInt(i + 1);
      char temp = password[i];
      password[i] = password[j];
      password[j] = temp;
    }
  }
}
