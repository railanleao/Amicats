package org.amicats.backend.application.factory.doseadministration;

import lombok.RequiredArgsConstructor;
import org.amicats.backend.domain.interfaces.dataprovider.cat.CatDataProvider;
import org.amicats.backend.domain.interfaces.dataprovider.doseadministration.DoseAdministrationDataProvider;
import org.amicats.backend.domain.interfaces.dataprovider.prescribedmedication.PrescribedMedicationDataProvider;
import org.amicats.backend.domain.interfaces.dataprovider.user.UserDataProvider;
import org.amicats.backend.domain.usecase.doseadministration.read.ReadDoseAdministrationUseCase;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Scope;

@Configuration
@RequiredArgsConstructor
public class ReadDoseAdministrationFactory {

    private final DoseAdministrationDataProvider doseAdministrationDataProvider;
    private final PrescribedMedicationDataProvider prescribedMedicationDataProvider;
    private final CatDataProvider catDataProvider;
    private final UserDataProvider userDataProvider;

    @Bean("ReadDoseAdministrationUseCase")
    @Scope(ConfigurableBeanFactory.SCOPE_PROTOTYPE)
    public ReadDoseAdministrationUseCase create() {
        return ReadDoseAdministrationUseCase.builder()
        .doseAdministrationDataProvider(doseAdministrationDataProvider)
        .prescribedMedicationDataProvider(prescribedMedicationDataProvider)
        .catDataProvider(catDataProvider).userDataProvider(userDataProvider).build();
    }
}
