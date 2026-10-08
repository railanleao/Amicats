package org.amicats.backend.repository.doseadministration;

import java.util.Optional;
import java.util.UUID;
import org.amicats.backend.domain.entity.DoseAdministration;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DoseAdministrationRepository extends JpaRepository<DoseAdministration, Integer> {
  @Override
  @EntityGraph(
      attributePaths = {
        "administeredBy",
        "prescribedMedication.cat",
        "prescribedMedication.medication"
      })
  Optional<DoseAdministration> findById(Integer id);

  @EntityGraph(
      attributePaths = {
        "administeredBy",
        "prescribedMedication.cat",
        "prescribedMedication.medication"
      })
  Optional<DoseAdministration> findByClientOperationId(UUID clientOperationId);

  @EntityGraph(
      attributePaths = {
        "administeredBy",
        "prescribedMedication.cat",
        "prescribedMedication.medication"
      })
  Page<DoseAdministration> findByPrescribedMedication_Id(Integer medicationId, Pageable pageable);

  @EntityGraph(
      attributePaths = {
        "administeredBy",
        "prescribedMedication.cat",
        "prescribedMedication.medication"
      })
  Page<DoseAdministration> findByPrescribedMedication_Cat_Id(Integer catId, Pageable pageable);
}
