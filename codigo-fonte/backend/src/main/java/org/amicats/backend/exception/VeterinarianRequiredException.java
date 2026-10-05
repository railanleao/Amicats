package org.amicats.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.FORBIDDEN)
public class VeterinarianRequiredException extends RuntimeException {

  public VeterinarianRequiredException(String message) {
    super(message);
  }
}
