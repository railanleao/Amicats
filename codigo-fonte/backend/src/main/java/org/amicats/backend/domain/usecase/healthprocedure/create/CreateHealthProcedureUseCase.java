package org.amicats.backend.domain.usecase.healthprocedure.create;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.Builder;
import org.amicats.backend.domain.entity.Cat;
import org.amicats.backend.domain.entity.HealthProcedure;
import org.amicats.backend.domain.entity.User;
import org.amicats.backend.domain.enums.HealthProcedureType;
import org.amicats.backend.domain.interfaces.dataprovider.cat.CatDataProvider;
import org.amicats.backend.domain.interfaces.dataprovider.healthprocedure.HealthProcedureDataProvider;
import org.amicats.backend.domain.interfaces.dataprovider.user.UserDataProvider;
import org.amicats.backend.domain.usecase.common.BusinessCalendar;
import org.amicats.backend.domain.usecase.healthprocedure.read.ReadHealthProcedureOutput;
import org.amicats.backend.exception.HealthProcedureConflictException;
import org.amicats.backend.exception.ResourceNotFoundException;
import org.springframework.transaction.annotation.Transactional;

@Builder
public class CreateHealthProcedureUseCase {

  private HealthProcedureDataProvider healthProcedureDataProvider;
  private CatDataProvider catDataProvider;
  private UserDataProvider userDataProvider;
  @Builder.Default private Clock clock = Clock.systemUTC();

  @Transactional
  public ReadHealthProcedureOutput execute(Integer userId, CreateHealthProcedureInput input) {
    User user =
        userDataProvider
            .findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado."));

    Cat cat =
        catDataProvider
            .findById(input.catId())
            .orElseThrow(() -> new ResourceNotFoundException("Gato não encontrado."));

    if (input.type() == HealthProcedureType.Neutering
        && healthProcedureDataProvider.existsScheduled(
            cat.getId(), HealthProcedureType.Neutering)) {
      throw new HealthProcedureConflictException(cat.getName() + " já tem uma castração agendada.");
    }

    LocalDate today = BusinessCalendar.today(clock);
    HealthProcedure healthProcedure =
        HealthProcedure.schedule(
            cat,
            input.type(),
            input.name(),
            input.scheduledDate(),
            input.notes(),
            user,
            LocalDateTime.now(clock),
            today);
    healthProcedureDataProvider.save(healthProcedure);

    return ReadHealthProcedureOutput.from(healthProcedure, today);
  }
}
