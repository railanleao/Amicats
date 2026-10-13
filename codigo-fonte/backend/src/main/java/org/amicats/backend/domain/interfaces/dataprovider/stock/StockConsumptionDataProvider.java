package org.amicats.backend.domain.interfaces.dataprovider.stock;

import org.amicats.backend.domain.entity.StockConsumption;

public interface StockConsumptionDataProvider {

  void save(StockConsumption consumption);
}
