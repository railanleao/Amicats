package org.amicats.backend.application.factory.prescribedmedication;

import lombok.AllArgsConstructor;
import org.amicats.backend.domain.interfaces.dataprovider.prescribedmedication.PrescribedMedicationDataProvider;
import org.amicats.backend.domain.interfaces.dataprovider.user.UserDataProvider;
import org.amicats.backend.domain.usecase.prescribedmedication.cancel.CancelPrescribedMedicationUseCase;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Scope;

@Configuration
@AllArgsConstructor
public class CancelPrescribedMedicationFactory {

  private PrescribedMedicationDataProvider prescribedMedicationDataProvider;
  private UserDataProvider userDataProvider;

  @Bean("CancelPrescribedMedicationUseCase")
  @Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
  public CancelPrescribedMedicationUseCase create() {
    return CancelPrescribedMedicationUseCase.builder()
        .prescribedMedicationDataProvider(prescribedMedicationDataProvider)
        .userDataProvider(userDataProvider)
        .build();
  }
}
