package org.amicats.backend.application.factory.externalattendance;

import lombok.AllArgsConstructor;
import org.amicats.backend.domain.interfaces.dataprovider.cat.CatDataProvider;
import org.amicats.backend.domain.interfaces.dataprovider.externalattendance.ExternalAttendanceDataProvider;
import org.amicats.backend.domain.usecase.externalattendance.create.CreateExternalAttendanceUseCase;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Scope;

@Configuration
@AllArgsConstructor
public class CreateExternalAttendanceFactory {

  private CatDataProvider catDataProvider;
  private ExternalAttendanceDataProvider externalAttendanceDataProvider;

  @Bean("CreateExternalAttendanceUseCase")
  @Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
  public CreateExternalAttendanceUseCase create() {
    return CreateExternalAttendanceUseCase.builder()
        .catDataProvider(catDataProvider)
        .externalAttendanceDataProvider(externalAttendanceDataProvider)
        .build();
  }
}
