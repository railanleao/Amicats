package org.amicats.backend.controller.doseadministration;

import org.amicats.backend.exception.DoseAdministrationAccessException;
import org.amicats.backend.exception.DoseAdministrationConflictException;
import org.amicats.backend.exception.InvalidDoseAdministrationException;
import org.amicats.backend.exception.ResourceNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice(assignableTypes = DoseAdministrationControllerImpl.class)
public class DoseAdministrationExceptionHandler {
  @ExceptionHandler(InvalidDoseAdministrationException.class)
  public ProblemDetail invalid(InvalidDoseAdministrationException exception) {
    return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, exception.getMessage());
  }

  @ExceptionHandler(DoseAdministrationConflictException.class)
  public ProblemDetail conflict(DoseAdministrationConflictException exception) {
    return ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, exception.getMessage());
  }

  @ExceptionHandler(DoseAdministrationAccessException.class)
  public ProblemDetail forbidden(DoseAdministrationAccessException exception) {
    return ProblemDetail.forStatusAndDetail(HttpStatus.FORBIDDEN, exception.getMessage());
  }

  @ExceptionHandler(ResourceNotFoundException.class)
  public ProblemDetail notFound(ResourceNotFoundException exception) {
    return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, exception.getMessage());
  }
}