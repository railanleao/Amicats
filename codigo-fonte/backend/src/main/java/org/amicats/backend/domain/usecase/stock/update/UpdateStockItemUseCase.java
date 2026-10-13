package org.amicats.backend.domain.usecase.stock.update;

import java.time.LocalDate;
import lombok.Builder;
import org.amicats.backend.domain.entity.StockItem;
import org.amicats.backend.domain.interfaces.dataprovider.stock.StockEntryDataProvider;
import org.amicats.backend.domain.interfaces.dataprovider.stock.StockItemDataProvider;
import org.amicats.backend.domain.usecase.stock.read.ReadStockItemOutput;
import org.amicats.backend.exception.InvalidStockConsumptionException;
import org.amicats.backend.exception.ResourceNotFoundException;
import org.amicats.backend.exception.StockConsumptionConflictException;
import org.springframework.transaction.annotation.Transactional;

@Builder
public class UpdateStockItemUseCase {

  private StockItemDataProvider stockItemDataProvider;
  private StockEntryDataProvider stockEntryDataProvider;

  @Transactional
  public ReadStockItemOutput execute(Integer id, UpdateStockItemInput input) {

    StockItem stockItem =
        stockItemDataProvider
            .findByIdForUpdate(id)
            .orElseThrow(
                () -> new ResourceNotFoundException("Item de estoque não encontrado: " + id));

    if (input.expectedQuantity() == null
        || input.expectedQuantity().compareTo(stockItem.getQuantity()) != 0) {
      throw new StockConsumptionConflictException(
          "O saldo mudou. Recarregue o estoque antes de salvar.");
    }
    if (!stockItem.getUnit().equalsIgnoreCase(input.unit().trim())) {
      throw new StockConsumptionConflictException(
          "A unidade de estoque não pode ser alterada. Cadastre outro item para outra unidade.");
    }
    stockItem.updateDetails(input.name(), input.category(), input.unit(), input.notes());

    if (input.quantity().signum() < 0 && input.quantity().compareTo(stockItem.getQuantity()) != 0) {
      throw new InvalidStockConsumptionException(
          "Um ajuste manual não pode definir um novo saldo negativo.");
    }
    stockItem.updateQuantity(input.quantity());

    StockItem savedStockItem = stockItemDataProvider.save(stockItem);

    LocalDate expirationDate =
        stockEntryDataProvider
            .findNearestExpirationDate(savedStockItem.getId(), LocalDate.now())
            .orElse(null);

    return ReadStockItemOutput.from(savedStockItem, expirationDate);
  }
}
