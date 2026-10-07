package org.amicats.backend.repository.doseadministration;

import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.amicats.backend.domain.entity.DoseAdministration;
import org.amicats.backend.domain.entity.PrescribedMedication;
import org.amicats.backend.domain.interfaces.dataprovider.doseadministration.DoseAdministrationDataProvider;
import org.amicats.backend.domain.usecase.common.PagedResult;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DoseAdministrationDataProviderImpl implements DoseAdministrationDataProvider {
  private final DoseAdministrationRepository repository;
  private final EntityManager entityManager;

  @Override
  public Optional<PrescribedMedication> findMedicationForUpdate(Integer id) {
    return Optional.ofNullable(entityManager.find(PrescribedMedication.class, id, LockModeType.PESSIMISTIC_WRITE));
  }

  @Override
  public Optional<DoseAdministration> findById(Integer id) {
    return repository.findById(id);
  }

  @Override
  public Optional<DoseAdministration> findByClientOperationId(UUID operationId) {
    return repository.findByClientOperationId(operationId);
  }

  @Override
  public InsertResult insertIfAbsent(DoseAdministration dose) {
    // Do not catch a unique-constraint exception inside the transaction: PostgreSQL would
    // abort it. ON CONFLICT waits for the competing insert without invalidating this one.
    int inserted = entityManager.createNativeQuery("""
        INSERT INTO dose_administrations
          (id_prescribed_medication, id_user_administered_by, client_operation_id,
           administered_at, recorded_at, notes, origin, dosage, route)
        VALUES (:medicationId, :userId, :operationId, :administeredAt, :recordedAt,
                :notes, :origin, :dosage, :route)
        ON CONFLICT (client_operation_id) DO NOTHING
        """)
        .setParameter("medicationId", dose.getPrescribedMedication().getId())
        .setParameter("userId", dose.getAdministeredBy().getId())
        .setParameter("operationId", dose.getClientOperationId())
        .setParameter("administeredAt", dose.getAdministeredAt())
        .setParameter("recordedAt", dose.getRecordedAt())
        .setParameter("notes", dose.getNotes())
        .setParameter("origin", dose.getOrigin().name())
        .setParameter("dosage", dose.getDosage())
        .setParameter("route", dose.getRoute().name())
        .executeUpdate();
    DoseAdministration saved = repository.findByClientOperationId(dose.getClientOperationId())
        .orElseThrow(() -> new IllegalStateException("Registro de dose não encontrado após inserção."));
    return new InsertResult(saved, inserted == 1);
  }

  @Override
  public PagedResult<DoseAdministration> findByMedication(Integer medicationId, int page, int size) {
    return map(repository.findByPrescribedMedication_Id(medicationId, pageable(page, size)));
  }

  @Override
  public PagedResult<DoseAdministration> findByCat(Integer catId, int page, int size) {
    return map(repository.findByPrescribedMedication_Cat_Id(catId, pageable(page, size)));
  }

  private PageRequest pageable(int page, int size) {
    return PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "administeredAt", "id"));
  }

  private PagedResult<DoseAdministration> map(Page<DoseAdministration> result) {
    return new PagedResult<>(result.getContent(), result.getNumber(), result.getSize(),
        result.getTotalElements(), result.getTotalPages());
  }
}