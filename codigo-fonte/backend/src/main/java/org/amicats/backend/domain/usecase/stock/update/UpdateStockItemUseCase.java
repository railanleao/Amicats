package org.amicats.backend.domain.usecase.stock.update;

import java.time.LocalDate;
import lombok.Builder;
import org.amicats.backend.domain.entity.StockItem;
import org.amicats.backend.domain.interfaces.dataprovider.stock.StockEntryDataProvider;
import org.amicats.backend.domain.interfaces.dataprovider.stock.StockItemDataProvider;
import org.amicats.backend.domain.usecase.stock.read.ReadStockItemOutput;
import org.amicats.backend.exception.ResourceNotFoundException;
import org.springframework.transaction.annotation.Transactional;

@Builder
public class UpdateStockItemUseCase {

  private StockItemDataProvider stockItemDataProvider;
  private StockEntryDataProvider stockEntryDataProvider;

  @Transactional
  public ReadStockItemOutput execute(Integer id, UpdateStockItemInput input) {

    StockItem stockItem =
        stockItemDataProvider
            .findById(id)
            .orElseThrow(
                () -> new ResourceNotFoundException("Item de estoque não encontrado: " + id));

    stockItem.updateDetails(input.name(), input.category(), input.unit(), input.notes());

    stockItem.updateQuantity(input.quantity());

    StockItem savedStockItem = stockItemDataProvider.save(stockItem);

    LocalDate expirationDate =
        stockEntryDataProvider
            .findNearestExpirationDate(savedStockItem.getId(), LocalDate.now())
            .orElse(null);

    return ReadStockItemOutput.from(savedStockItem, expirationDate);
  }
}
