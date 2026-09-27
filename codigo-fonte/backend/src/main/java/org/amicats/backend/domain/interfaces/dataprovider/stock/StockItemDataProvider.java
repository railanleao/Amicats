package org.amicats.backend.domain.interfaces.dataprovider.stock;

import org.amicats.backend.domain.entity.StockItem;
import org.amicats.backend.domain.usecase.common.PagedResult;
import org.amicats.backend.domain.usecase.stock.read.StockItemSearchCriteria;

import java.util.Optional;

public interface StockItemDataProvider {

  StockItem save(StockItem stockItem);

  Optional<StockItem> findById(Integer id);

  PagedResult<StockItem> search(StockItemSearchCriteria criteria);
}
