package org.amicats.backend.application.factory.internalmedicalprescription;

import lombok.AllArgsConstructor;
import org.amicats.backend.application.factory.prescribedmedication.CreatePrescribedMedicationFactory;
import org.amicats.backend.domain.interfaces.dataprovider.cat.CatDataProvider;
import org.amicats.backend.domain.interfaces.dataprovider.internalmedicalprescription.InternalMedicalPrescriptionDataProvider;
import org.amicats.backend.domain.interfaces.dataprovider.user.UserDataProvider;
import org.amicats.backend.domain.usecase.internalmedicalprescription.create.CreateInternalMedicalPrescriptionUseCase;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Scope;

@Configuration
@AllArgsConstructor
public class CreateInternalMedicalPrescriptionFactory {

  private CatDataProvider catDataProvider;
  private UserDataProvider userDataProvider;
  private InternalMedicalPrescriptionDataProvider internalMedicalPrescriptionDataProvider;
  private CreatePrescribedMedicationFactory createPrescribedMedicationFactory;

  @Bean("CreateInternalMedicalPrescriptionUseCase")
  @Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
  public CreateInternalMedicalPrescriptionUseCase create() {
    return CreateInternalMedicalPrescriptionUseCase.builder()
        .catDataProvider(catDataProvider)
        .userDataProvider(userDataProvider)
        .internalMedicalPrescriptionDataProvider(internalMedicalPrescriptionDataProvider)
        .createPrescribedMedicationUseCase(createPrescribedMedicationFactory.create())
        .build();
  }
}
