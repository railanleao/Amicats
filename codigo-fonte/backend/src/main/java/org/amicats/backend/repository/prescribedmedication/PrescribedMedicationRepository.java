package org.amicats.backend.repository.prescribedmedication;

import jakarta.persistence.LockModeType;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.amicats.backend.domain.entity.PrescribedMedication;
import org.amicats.backend.domain.enums.PrescribedMedicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PrescribedMedicationRepository
    extends JpaRepository<PrescribedMedication, Integer> {

  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("select pm from PrescribedMedication pm where pm.id = :id")
  Optional<PrescribedMedication> findByIdForUpdate(@Param("id") Integer id);

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

  @Query(
      """
    select pm from PrescribedMedication pm
    join fetch pm.medication
    left join fetch pm.internalMedicalPrescription
    where pm.updatedAt >= :since
    """)
  List<PrescribedMedication> findUpdatedSince(@Param("since") LocalDateTime since);
}
