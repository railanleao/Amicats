package org.amicats.backend.repository.stock;

import lombok.RequiredArgsConstructor;
import org.amicats.backend.domain.entity.StockConsumption;
import org.amicats.backend.domain.interfaces.dataprovider.stock.StockConsumptionDataProvider;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class StockConsumptionDataProviderImpl implements StockConsumptionDataProvider {

  private final StockConsumptionRepository repository;

  @Override
  public void save(StockConsumption consumption) {
    repository.save(consumption);
  }
}
