package org.amicats.backend.repository.stock;

import org.amicats.backend.domain.entity.StockConsumption;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StockConsumptionRepository extends JpaRepository<StockConsumption, Integer> {

  long countByDose_Id(Integer doseId);

  void deleteByDose_Id(Integer doseId);
}
