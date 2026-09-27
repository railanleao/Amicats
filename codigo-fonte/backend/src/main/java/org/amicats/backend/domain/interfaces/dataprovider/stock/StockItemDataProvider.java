package org.amicats.backend.domain.interfaces.dataprovider.stock;

import java.util.Optional;
import org.amicats.backend.domain.entity.StockItem;
import org.amicats.backend.domain.usecase.common.PagedResult;
import org.amicats.backend.domain.usecase.stock.read.StockItemSearchCriteria;

public interface StockItemDataProvider {

  StockItem save(StockItem stockItem);

  Optional<StockItem> findById(Integer id);

  PagedResult<StockItem> search(StockItemSearchCriteria criteria);
}
