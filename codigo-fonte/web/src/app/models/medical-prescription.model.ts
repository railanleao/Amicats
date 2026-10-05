import { StockStatus } from './stock.model';

export type AdministrationRoute =
  | 'Oral'
  | 'Subcutaneous'
  | 'Intramuscular'
  | 'Intravenous'
  | 'Topical'
  | 'Ophthalmic'
  | 'Otic';

export type MedicalPrescriptionStatus =
  'InTreatment' | 'Completed' | 'Cancelled';
export type MedicalPrescriptionOrigin = 'Internal' | 'ExternalClinic';
export type PrescribedMedicationStatus = 'Active' | 'Completed' | 'Cancelled';

export const ADMINISTRATION_ROUTE_LABELS: Record<AdministrationRoute, string> =
  {
    Oral: 'Oral',
    Subcutaneous: 'Subcutânea',
    Intramuscular: 'Intramuscular',
    Intravenous: 'Intravenosa',
    Topical: 'Tópica',
    Ophthalmic: 'Oftálmica',
    Otic: 'Otológica',
  };

export interface PrescribedMedication {
  id: number;
  origin: MedicalPrescriptionOrigin;
  medicalPrescriptionId: number | null;
  medicationId: number;
  medicationName: string;
  medicationStockStatus: StockStatus;
  dosage: string;
  route: AdministrationRoute;
  intervalHours: number;
  durationDays: number;
  startDate: string;
  endDate: string;
  status: PrescribedMedicationStatus;
  stockWarning: string | null;
}

export interface InternalMedicalPrescription {
  id: number;
  catId: number;
  status: MedicalPrescriptionStatus;
  title: string;
  notes: string | null;
  veterinarianName: string;
  veterinarianCrmv: string;
  veterinarianUfCrmv: string;
  createdAt: string;
  medication: PrescribedMedication | null;
}

export interface CreatePrescribedMedicationRequest {
  medicationId: number | null;
  newMedicationName: string | null;
  newMedicationUnit: string | null;
  dosage: string;
  route: AdministrationRoute;
  intervalHours: number;
  durationDays: number;
}

export interface CreateInternalMedicalPrescriptionRequest {
  title: string;
  notes: string | null;
  medication: CreatePrescribedMedicationRequest | null;
}
