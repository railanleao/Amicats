package org.amicats.backend.application.factory.prescribedmedication;

import lombok.AllArgsConstructor;
import org.amicats.backend.domain.interfaces.dataprovider.cat.CatDataProvider;
import org.amicats.backend.domain.interfaces.dataprovider.prescribedmedication.PrescribedMedicationDataProvider;
import org.amicats.backend.domain.usecase.prescribedmedication.read.ReadPrescribedMedicationUseCase;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Scope;

@Configuration
@AllArgsConstructor
public class ReadPrescribedMedicationFactory {

  private CatDataProvider catDataProvider;
  private PrescribedMedicationDataProvider prescribedMedicationDataProvider;

  @Bean("ReadPrescribedMedicationUseCase")
  @Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
  public ReadPrescribedMedicationUseCase create() {
    return ReadPrescribedMedicationUseCase.builder()
        .catDataProvider(catDataProvider)
        .prescribedMedicationDataProvider(prescribedMedicationDataProvider)
        .build();
  }
}
