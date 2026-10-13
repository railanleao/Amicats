package org.amicats.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class StockConsumptionConflictException extends RuntimeException {

  public StockConsumptionConflictException(String message) {
    super(message);
  }
}
