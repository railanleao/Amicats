package org.amicats.backend.application.factory.prescribedmedication;

import lombok.AllArgsConstructor;
import org.amicats.backend.domain.interfaces.dataprovider.prescribedmedication.PrescribedMedicationDataProvider;
import org.amicats.backend.domain.interfaces.dataprovider.stock.StockItemDataProvider;
import org.amicats.backend.domain.usecase.prescribedmedication.create.CreatePrescribedMedicationUseCase;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Scope;

@Configuration
@AllArgsConstructor
public class CreatePrescribedMedicationFactory {

  private StockItemDataProvider stockItemDataProvider;
  private PrescribedMedicationDataProvider prescribedMedicationDataProvider;

  @Bean("CreatePrescribedMedicationUseCase")
  @Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
  public CreatePrescribedMedicationUseCase create() {
    return CreatePrescribedMedicationUseCase.builder()
        .stockItemDataProvider(stockItemDataProvider)
        .prescribedMedicationDataProvider(prescribedMedicationDataProvider)
        .build();
  }
}
