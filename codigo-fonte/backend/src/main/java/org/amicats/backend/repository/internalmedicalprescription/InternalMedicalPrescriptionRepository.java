package org.amicats.backend.repository.internalmedicalprescription;

import org.amicats.backend.domain.entity.InternalMedicalPrescription;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InternalMedicalPrescriptionRepository
    extends JpaRepository<InternalMedicalPrescription, Integer> {}
