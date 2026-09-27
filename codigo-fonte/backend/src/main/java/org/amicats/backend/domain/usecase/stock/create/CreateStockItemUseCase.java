package org.amicats.backend.domain.usecase.stock.create;

import lombok.Builder;
import org.amicats.backend.domain.entity.StockItem;
import org.amicats.backend.domain.interfaces.dataprovider.stock.StockItemDataProvider;
import org.amicats.backend.domain.usecase.stock.read.ReadStockItemOutput;
import org.springframework.transaction.annotation.Transactional;

@Builder
public class CreateStockItemUseCase {

  private StockItemDataProvider stockItemDataProvider;

  @Transactional
  public ReadStockItemOutput execute(CreateStockItemInput input) {
    StockItem stockItem =
      new StockItem(
        input.name(),
        input.category(),
        input.quantity(),
        input.unit(),
        input.notes());

    stockItemDataProvider.save(stockItem);

    return ReadStockItemOutput.from(stockItem);
  }
}
