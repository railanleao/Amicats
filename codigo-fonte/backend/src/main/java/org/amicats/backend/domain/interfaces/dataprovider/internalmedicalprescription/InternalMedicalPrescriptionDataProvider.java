package org.amicats.backend.domain.interfaces.dataprovider.internalmedicalprescription;

import org.amicats.backend.domain.entity.InternalMedicalPrescription;

public interface InternalMedicalPrescriptionDataProvider {

  InternalMedicalPrescription save(InternalMedicalPrescription internalMedicalPrescription);
}
