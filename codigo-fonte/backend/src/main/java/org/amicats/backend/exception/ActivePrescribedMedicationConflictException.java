package org.amicats.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class ActivePrescribedMedicationConflictException extends RuntimeException {

  public ActivePrescribedMedicationConflictException(String message) {
    super(message);
  }
}
