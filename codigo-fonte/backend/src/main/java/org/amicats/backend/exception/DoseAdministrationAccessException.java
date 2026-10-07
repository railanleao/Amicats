package org.amicats.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.FORBIDDEN)
public class DoseAdministrationAccessException extends RuntimeException {
  public DoseAdministrationAccessException(String message) {
    super(message);
  }
}