package org.amicats.backend.application.factory.cat;

import lombok.RequiredArgsConstructor;
import org.amicats.backend.domain.interfaces.dataprovider.cat.CatDataProvider;
import org.amicats.backend.domain.usecase.cat.read.ReadCatUseCase;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ReadCatFactory {

  private final CatDataProvider catDataProvider;

  public ReadCatUseCase create() {
    return ReadCatUseCase.builder().catDataProvider(catDataProvider).build();
  }
}
