package org.amicats.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_GATEWAY)
public class AccessEmailNotSentException extends RuntimeException {

  public AccessEmailNotSentException(String email, Throwable cause) {
    super("Não foi possível enviar o e-mail de acesso para: " + email, cause);
  }
}
