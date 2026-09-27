package org.amicats.backend.controller.stock;

import lombok.RequiredArgsConstructor;
import org.amicats.backend.application.factory.stock.CreateStockEntryFactory;
import org.amicats.backend.application.factory.stock.CreateStockItemFactory;
import org.amicats.backend.application.factory.stock.ReadStockItemFactory;
import org.amicats.backend.domain.usecase.common.PagedResult;
import org.amicats.backend.domain.usecase.stock.create.CreateStockItemInput;
import org.amicats.backend.domain.usecase.stock.entry.CreateStockEntryInput;
import org.amicats.backend.domain.usecase.stock.read.ReadStockItemOutput;
import org.amicats.backend.domain.usecase.stock.read.StockItemSearchCriteria;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RestController;
import org.amicats.backend.domain.enums.StockStatus;
import java.time.LocalDate;
import org.amicats.backend.application.factory.stock.UpdateStockItemFactory;
import org.amicats.backend.domain.usecase.stock.update.UpdateStockItemInput;

@RestController
@RequiredArgsConstructor
public class StockControllerImpl implements StockController {

  private final CreateStockItemFactory createStockItemFactory;
  private final ReadStockItemFactory readStockItemFactory;
  private final CreateStockEntryFactory createStockEntryFactory;
  private final UpdateStockItemFactory updateStockItemFactory;

  @Override
  @PreAuthorize("hasAnyRole('Administrator', 'Assistant')")
  public PagedResult<ReadStockItemOutput> list(
    String search,
    String category,
    StockStatus status,
    LocalDate expirationFrom,
    LocalDate expirationTo,
    int page,
    int size) {

    StockItemSearchCriteria criteria =
      new StockItemSearchCriteria(
        search,
        category,
        status,
        expirationFrom,
        expirationTo,
        page,
        size);


    return readStockItemFactory.create().search(criteria);
  }

  @Override
  @PreAuthorize("hasAnyRole('Administrator', 'Assistant')")
  public ReadStockItemOutput findById(Integer id) {
    return readStockItemFactory.create().findById(id);
  }

  @Override
  @PreAuthorize("hasAnyRole('Administrator', 'Assistant')")
  public ReadStockItemOutput create(CreateStockItemInput input) {
    return createStockItemFactory.create().execute(input);
  }

  @Override
  @PreAuthorize("hasAnyRole('Administrator', 'Assistant')")
  public ReadStockItemOutput update(
    Integer id,
    UpdateStockItemInput input) {

    return updateStockItemFactory.create().execute(id, input);
  }


  @Override
  @PreAuthorize("hasAnyRole('Administrator', 'Assistant')")
  public void registerEntry(CreateStockEntryInput input) {
    createStockEntryFactory.create().execute(input);
  }
}
