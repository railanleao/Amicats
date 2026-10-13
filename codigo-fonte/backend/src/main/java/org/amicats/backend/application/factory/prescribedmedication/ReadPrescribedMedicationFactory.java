package org.amicats.backend.application.factory.prescribedmedication;

import java.time.ZoneId;
import lombok.RequiredArgsConstructor;
import org.amicats.backend.domain.interfaces.dataprovider.cat.CatDataProvider;
import org.amicats.backend.domain.interfaces.dataprovider.prescribedmedication.PrescribedMedicationDataProvider;
import org.amicats.backend.domain.usecase.prescribedmedication.read.ReadPrescribedMedicationUseCase;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Scope;

@Configuration
@RequiredArgsConstructor
public class ReadPrescribedMedicationFactory {

  private final CatDataProvider catDataProvider;
  private final PrescribedMedicationDataProvider prescribedMedicationDataProvider;

  @Value("${app.clinical-time-zone:America/Sao_Paulo}")
  private String clinicalTimeZone;

  @Bean("ReadPrescribedMedicationUseCase")
  @Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
  public ReadPrescribedMedicationUseCase create() {
    return ReadPrescribedMedicationUseCase.builder()
        .catDataProvider(catDataProvider)
        .prescribedMedicationDataProvider(prescribedMedicationDataProvider)
        .clinicalZone(ZoneId.of(clinicalTimeZone))
        .build();
  }
}
