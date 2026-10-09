import { apiRequest } from './api';
import type {
  CreateInternalMedicalPrescriptionRequest,
  InternalMedicalPrescription,
  PrescribedMedication,
} from '../types/medicalPrescription';

export function createInternalMedicalPrescription(
  catId: number,
  request: CreateInternalMedicalPrescriptionRequest,
): Promise<InternalMedicalPrescription> {
  return apiRequest<InternalMedicalPrescription>(`/cats/${catId}/internal-medical-prescriptions`, {
    method: 'POST',
    body: request,
  });
}

export function listActivePrescribedMedications(catId: number): Promise<PrescribedMedication[]> {
  return apiRequest<PrescribedMedication[]>(`/cats/${catId}/prescribed-medications/active`);
}
