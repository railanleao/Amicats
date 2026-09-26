package org.amicats.backend.domain.usecase.stock.entry;

import lombok.Builder;
import org.amicats.backend.domain.entity.StockEntry;
import org.amicats.backend.domain.entity.StockItem;
import org.amicats.backend.domain.interfaces.dataprovider.stock.StockEntryDataProvider;
import org.amicats.backend.domain.interfaces.dataprovider.stock.StockItemDataProvider;
import org.amicats.backend.exception.ResourceNotFoundException;
import org.springframework.transaction.annotation.Transactional;

@Builder
public class CreateStockEntryUseCase {

  private StockItemDataProvider stockItemDataProvider;
  private StockEntryDataProvider stockEntryDataProvider;

  @Transactional
  public void execute(CreateStockEntryInput input) {
    StockItem stockItem =
      stockItemDataProvider
        .findById(input.stockItemId())
        .orElseThrow(
          () ->
            new ResourceNotFoundException(
              "Item de estoque não encontrado: " + input.stockItemId()));

    StockEntry stockEntry =
      new StockEntry(
        stockItem,
        input.origin(),
        input.donorName(),
        input.quantity(),
        input.entryDate(),
        input.expirationDate());

    stockEntryDataProvider.save(stockEntry);

    stockItem.updateQuantity(
      stockItem.getQuantity().add(input.quantity()));

    stockItemDataProvider.save(stockItem);
  }
}
