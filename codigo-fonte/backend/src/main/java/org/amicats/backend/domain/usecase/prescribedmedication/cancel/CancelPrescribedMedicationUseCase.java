package org.amicats.backend.domain.usecase.prescribedmedication.cancel;

import java.time.Clock;
import java.time.LocalDateTime;
import java.time.ZoneId;
import lombok.Builder;
import org.amicats.backend.domain.entity.PrescribedMedication;
import org.amicats.backend.domain.entity.User;
import org.amicats.backend.domain.interfaces.dataprovider.prescribedmedication.PrescribedMedicationDataProvider;
import org.amicats.backend.domain.interfaces.dataprovider.user.UserDataProvider;
import org.amicats.backend.domain.policy.DoseAdministrationTimePolicy;
import org.amicats.backend.domain.usecase.common.VeterinarianPolicy;
import org.amicats.backend.domain.usecase.prescribedmedication.read.ReadPrescribedMedicationOutput;
import org.amicats.backend.exception.ResourceNotFoundException;
import org.springframework.transaction.annotation.Transactional;

@Builder
public class CancelPrescribedMedicationUseCase {

  private PrescribedMedicationDataProvider prescribedMedicationDataProvider;
  private UserDataProvider userDataProvider;
  @Builder.Default private Clock clock = Clock.systemUTC();
  @Builder.Default private ZoneId clinicalZone = DoseAdministrationTimePolicy.DEFAULT_CLINICAL_ZONE;

  @Transactional
  public ReadPrescribedMedicationOutput execute(
      Integer prescribedMedicationId, Integer userId, CancelPrescribedMedicationInput input) {
    User veterinarian = VeterinarianPolicy.requireVeterinarian(userDataProvider, userId);

    PrescribedMedication prescribedMedication =
        prescribedMedicationDataProvider
            .findByIdForUpdate(prescribedMedicationId)
            .orElseThrow(() -> new ResourceNotFoundException("Medicação não encontrada."));

    LocalDateTime now = DoseAdministrationTimePolicy.nowUtc(clock);
    prescribedMedication.cancel(veterinarian, input.reason().trim(), now, clinicalZone);
    prescribedMedicationDataProvider.save(prescribedMedication);

    return ReadPrescribedMedicationOutput.from(
        prescribedMedication, DoseAdministrationTimePolicy.clinicalDate(now, clinicalZone));
  }
}
