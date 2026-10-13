package org.amicats.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class DoseAdministrationConflictException extends RuntimeException {
  public DoseAdministrationConflictException(String message) {
    super(message);
  }
}
