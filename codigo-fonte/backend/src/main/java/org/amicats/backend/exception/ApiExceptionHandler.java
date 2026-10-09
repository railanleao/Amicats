package org.amicats.backend.exception;

import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

// Spring Boot's default error page omits the exception message unless
// server.error.include-message is set (off by default, for security). This app's own business
// exceptions are all plain RuntimeExceptions annotated with @ResponseStatus — this handler
// surfaces their message as JSON for every one of them, present and future, without listing them
// one by one. Anything NOT annotated (a genuine bug) is rethrown so Spring's default 500 handling
// still applies.
@RestControllerAdvice
public class ApiExceptionHandler {

  @ExceptionHandler(RuntimeException.class)
  public ResponseEntity<Map<String, String>> handleAnnotatedException(RuntimeException exception) {
    ResponseStatus responseStatus = exception.getClass().getAnnotation(ResponseStatus.class);
    if (responseStatus == null) {
      throw exception;
    }

    return ResponseEntity.status(responseStatus.value())
        .body(Map.of("message", exception.getMessage()));
  }
}
