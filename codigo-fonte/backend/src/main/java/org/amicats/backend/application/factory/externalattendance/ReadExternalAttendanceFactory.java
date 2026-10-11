package org.amicats.backend.application.factory.externalattendance;

import lombok.AllArgsConstructor;
import org.amicats.backend.domain.interfaces.dataprovider.cat.CatDataProvider;
import org.amicats.backend.domain.interfaces.dataprovider.externalattendance.ExternalAttendanceDataProvider;
import org.amicats.backend.domain.usecase.externalattendance.read.ReadExternalAttendanceUseCase;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Scope;

@Configuration
@AllArgsConstructor
public class ReadExternalAttendanceFactory {

  private CatDataProvider catDataProvider;
  private ExternalAttendanceDataProvider externalAttendanceDataProvider;

  @Bean("ReadExternalAttendanceUseCase")
  @Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
  public ReadExternalAttendanceUseCase create() {
    return ReadExternalAttendanceUseCase.builder()
        .catDataProvider(catDataProvider)
        .externalAttendanceDataProvider(externalAttendanceDataProvider)
        .build();
  }
}
