package org.amicats.backend.domain.usecase.prescribedmedication.cancel;

import java.time.Clock;
import java.time.LocalDateTime;
import lombok.Builder;
import org.amicats.backend.domain.entity.PrescribedMedication;
import org.amicats.backend.domain.entity.User;
import org.amicats.backend.domain.interfaces.dataprovider.prescribedmedication.PrescribedMedicationDataProvider;
import org.amicats.backend.domain.interfaces.dataprovider.user.UserDataProvider;
import org.amicats.backend.domain.usecase.common.VeterinarianPolicy;
import org.amicats.backend.domain.usecase.prescribedmedication.read.ReadPrescribedMedicationOutput;
import org.amicats.backend.exception.ResourceNotFoundException;
import org.springframework.transaction.annotation.Transactional;

@Builder
public class CancelPrescribedMedicationUseCase {

  private PrescribedMedicationDataProvider prescribedMedicationDataProvider;
  private UserDataProvider userDataProvider;
  @Builder.Default private Clock clock = Clock.systemUTC();

  @Transactional
  public ReadPrescribedMedicationOutput execute(
      Integer prescribedMedicationId, Integer userId, CancelPrescribedMedicationInput input) {
    User veterinarian = VeterinarianPolicy.requireVeterinarian(userDataProvider, userId);

    PrescribedMedication prescribedMedication =
        prescribedMedicationDataProvider
            .findById(prescribedMedicationId)
            .orElseThrow(() -> new ResourceNotFoundException("Medicação não encontrada."));

    LocalDateTime now = LocalDateTime.now(clock);
    prescribedMedication.cancel(veterinarian, input.reason().trim(), now);
    prescribedMedicationDataProvider.save(prescribedMedication);

    return ReadPrescribedMedicationOutput.from(prescribedMedication, now.toLocalDate());
  }
}
