package org.amicats.backend.domain.usecase.doseadministration.register;

import java.time.Clock;
import java.time.LocalDateTime;
import lombok.Builder;
import org.amicats.backend.domain.entity.DoseAdministration;
import org.amicats.backend.domain.entity.PrescribedMedication;
import org.amicats.backend.domain.entity.User;
import org.amicats.backend.domain.interfaces.dataprovider.doseadministration.DoseAdministrationDataProvider;
import org.amicats.backend.domain.interfaces.dataprovider.user.UserDataProvider;
import org.amicats.backend.domain.usecase.doseadministration.common.DoseAdministrationPolicy;
import org.amicats.backend.domain.usecase.doseadministration.read.ReadDoseAdministrationOutput;
import org.amicats.backend.exception.DoseAdministrationConflictException;
import org.amicats.backend.exception.InvalidDoseAdministrationException;
import org.amicats.backend.exception.ResourceNotFoundException;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

@Builder
public class RegisterDoseAdministrationUseCase {
  private DoseAdministrationDataProvider doseAdministrationDataProvider;
  private UserDataProvider userDataProvider;
  @Builder.Default private Clock clock = Clock.systemDefaultZone();

  @Transactional(isolation = Isolation.READ_COMMITTED)
  public RegisterDoseAdministrationResult execute(
      Integer medicationId, Integer userId, RegisterDoseAdministrationInput input) {
    User user = DoseAdministrationPolicy.requireWriter(userDataProvider, userId);
    if (input == null
        || input.clientOperationId() == null
        || input.administeredAt() == null
        || input.origin() == null
        || (input.notes() != null && input.notes().length() > 2000)) {
      throw new InvalidDoseAdministrationException("Dados da dose ausentes ou inválidos.");
    }

    var previous =
        doseAdministrationDataProvider.findByClientOperationId(input.clientOperationId());
    if (previous.isPresent()) {
      verifyReplay(previous.get(), medicationId, userId, input);
      return new RegisterDoseAdministrationResult(
          ReadDoseAdministrationOutput.from(previous.get()), false);
    }

    PrescribedMedication medication =
        doseAdministrationDataProvider
            .findMedicationForUpdate(medicationId)
            .orElseThrow(
                () -> new ResourceNotFoundException("Medicação prescrita não encontrada."));

    // After waiting for the row lock, another request might already have registered this operation.
    previous = doseAdministrationDataProvider.findByClientOperationId(input.clientOperationId());
    if (previous.isPresent()) {
      verifyReplay(previous.get(), medicationId, userId, input);
      return new RegisterDoseAdministrationResult(
          ReadDoseAdministrationOutput.from(previous.get()), false);
    }

    DoseAdministration dose =
        DoseAdministration.register(
            medication,
            user,
            input.clientOperationId(),
            input.administeredAt(),
            LocalDateTime.now(clock),
            input.notes(),
            input.origin());
    var result = doseAdministrationDataProvider.insertIfAbsent(dose);
    // Also covers the same operation UUID racing against a different medication.
    verifyReplay(result.dose(), medicationId, userId, input);
    return new RegisterDoseAdministrationResult(
        ReadDoseAdministrationOutput.from(result.dose()), result.created());
  }

  private void verifyReplay(
      DoseAdministration dose,
      Integer medicationId,
      Integer userId,
      RegisterDoseAdministrationInput input) {
    if (!dose.matches(
        medicationId, userId, input.administeredAt(), input.notes(), input.origin())) {
      throw new DoseAdministrationConflictException(
          "clientOperationId já utilizado em outro lançamento. Reenvie os dados originais.");
    }
  }
}
