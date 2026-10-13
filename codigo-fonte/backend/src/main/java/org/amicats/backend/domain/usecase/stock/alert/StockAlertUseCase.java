package org.amicats.backend.domain.usecase.stock.alert;

import lombok.Builder;
import org.amicats.backend.domain.enums.AccessType;
import org.amicats.backend.domain.interfaces.dataprovider.stock.StockItemDataProvider;
import org.amicats.backend.domain.interfaces.dataprovider.user.UserDataProvider;
import org.amicats.backend.domain.usecase.common.PagedResult;
import org.amicats.backend.domain.usecase.doseadministration.common.DoseAdministrationPolicy;
import org.amicats.backend.exception.DoseAdministrationAccessException;
import org.amicats.backend.exception.ResourceNotFoundException;
import org.springframework.transaction.annotation.Transactional;

@Builder
public class StockAlertUseCase {
  private StockItemDataProvider stockItemDataProvider;
  private UserDataProvider userDataProvider;

  @Transactional(readOnly = true)
  public PagedResult<StockAlertOutput> list(Integer userId, int page, int size) {
    DoseAdministrationPolicy.requireWriter(userDataProvider, userId);
    var result =
        stockItemDataProvider.findMedicationAlerts(
            Math.max(0, page), size <= 0 ? 20 : Math.min(size, 100));
    return new PagedResult<>(
        result.content().stream().map(StockAlertOutput::from).toList(),
        result.page(),
        result.size(),
        result.totalElements(),
        result.totalPages());
  }

  @Transactional
  public StockAlertOutput changeMinimum(
      Integer id, Integer userId, ChangeMinimumQuantityInput input) {
    var user = DoseAdministrationPolicy.requireWriter(userDataProvider, userId);
    if (user.getAccessType() != AccessType.Administrator
        && user.getAccessType() != AccessType.Assistant) {
      throw new DoseAdministrationAccessException(
          "Perfil sem permissão para alterar o limite de estoque.");
    }
    var stock =
        stockItemDataProvider
            .findByIdForUpdate(id)
            .orElseThrow(() -> new ResourceNotFoundException("Item de estoque não encontrado."));
    stock.changeMinimumQuantity(input.minimumQuantity());
    return StockAlertOutput.from(stockItemDataProvider.save(stock));
  }
}
