package org.amicats.backend.domain.usecase.healthprocedure.cancel;

import java.time.Clock;
import java.time.LocalDateTime;
import lombok.Builder;
import org.amicats.backend.domain.entity.HealthProcedure;
import org.amicats.backend.domain.entity.User;
import org.amicats.backend.domain.interfaces.dataprovider.healthprocedure.HealthProcedureDataProvider;
import org.amicats.backend.domain.interfaces.dataprovider.user.UserDataProvider;
import org.amicats.backend.domain.usecase.common.BusinessCalendar;
import org.amicats.backend.domain.usecase.healthprocedure.read.ReadHealthProcedureOutput;
import org.amicats.backend.exception.ResourceNotFoundException;
import org.springframework.transaction.annotation.Transactional;

@Builder
public class CancelHealthProcedureUseCase {

  private HealthProcedureDataProvider healthProcedureDataProvider;
  private UserDataProvider userDataProvider;
  @Builder.Default private Clock clock = Clock.systemUTC();

  @Transactional
  public ReadHealthProcedureOutput execute(
      Integer id, Integer userId, CancelHealthProcedureInput input) {
    User user =
        userDataProvider
            .findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado."));

    HealthProcedure healthProcedure =
        healthProcedureDataProvider
            .findByIdForUpdate(id)
            .orElseThrow(() -> new ResourceNotFoundException("Agendamento não encontrado."));

    healthProcedure.cancel(input.reason(), user, LocalDateTime.now(clock));
    healthProcedureDataProvider.save(healthProcedure);

    return ReadHealthProcedureOutput.from(healthProcedure, BusinessCalendar.today(clock));
  }
}
