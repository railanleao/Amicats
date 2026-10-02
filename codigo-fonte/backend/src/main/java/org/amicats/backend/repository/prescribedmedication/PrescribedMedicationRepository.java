package org.amicats.backend.repository.prescribedmedication;

import java.time.LocalDate;
import java.util.List;
import org.amicats.backend.domain.entity.PrescribedMedication;
import org.amicats.backend.domain.enums.PrescribedMedicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PrescribedMedicationRepository
    extends JpaRepository<PrescribedMedication, Integer> {

  @Query(
      """
    select pm from PrescribedMedication pm
    join fetch pm.medication
    left join fetch pm.internalMedicalPrescription
    where pm.cat.id = :catId
      and pm.medication.id = :medicationId
      and pm.status = :status
      and pm.endDate >= :today
    """)
  List<PrescribedMedication> findActiveByCatAndMedication(
      @Param("catId") Integer catId,
      @Param("medicationId") Integer medicationId,
      @Param("status") PrescribedMedicationStatus status,
      @Param("today") LocalDate today);

  @Query(
      """
    select pm from PrescribedMedication pm
    join fetch pm.medication
    left join fetch pm.internalMedicalPrescription
    where pm.cat.id = :catId
      and pm.status = :status
      and pm.endDate >= :today
    order by pm.endDate asc
    """)
  List<PrescribedMedication> findActiveByCat(
      @Param("catId") Integer catId,
      @Param("status") PrescribedMedicationStatus status,
      @Param("today") LocalDate today);
}
