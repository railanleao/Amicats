// Mirrors the backend's Cat domain (org.amicats.backend.domain.entity.Cat and
// CreateCatInput). A colleague built the entity, listing, search and cover-photo endpoints in a
// separate task; this only adds the create request shape on top of it, matching the mobile app's
// src/types/cat.ts.
//
// CreateCatInput doesn't accept healthStatus, pifResult, severity or neuteringStatus — those are
// set later through separate clinical use cases (registerFivFelvExam, registerPifExam,
// updateSeverity, registerNeutering), none of which have an endpoint yet. "Situação clínica" is
// the only health-ish field this form can actually submit.
export type Sex = 'Male' | 'Female';
export type AgeGroup = 'Kitten' | 'Young' | 'Adult' | 'Senior';
export type GeneralStatus =
  | 'UnderTreatment'
  | 'AvailableForAdoption'
  | 'InTriage'
  | 'Adopted'
  | 'TemporaryHome'
  | 'InClinic'
  | 'Deceased'
  | 'Missing';
export type HealthStatus = 'Healthy' | 'Fiv' | 'Felv' | 'FivFelv' | 'NotTested';
export type PifResult = 'Positive' | 'Negative' | 'NotTested';
export type Severity = 'Low' | 'Medium' | 'High' | 'VeryHigh';
export type NeuteringStatus = 'Neutered' | 'NotNeutered' | 'Scheduled';

export const SEX_LABELS: Record<Sex, string> = {
  Male: 'Macho',
  Female: 'Fêmea',
};

export const AGE_GROUP_LABELS: Record<AgeGroup, string> = {
  Kitten: 'Filhote',
  Young: 'Jovem',
  Adult: 'Adulto',
  Senior: 'Sênior',
};

export const GENERAL_STATUS_LABELS: Record<GeneralStatus, string> = {
  UnderTreatment: 'Em tratamento',
  AvailableForAdoption: 'Disponível para adoção',
  InTriage: 'Em triagem',
  Adopted: 'Adotado',
  TemporaryHome: 'Lar temporário',
  InClinic: 'Em clínica',
  Deceased: 'Óbito',
  Missing: 'Desaparecido',
};

export const HEALTH_STATUS_LABELS: Record<HealthStatus, string> = {
  Healthy: 'Saudável',
  Fiv: 'FIV+',
  Felv: 'FeLV+',
  FivFelv: 'FIV+/FeLV+',
  NotTested: 'Não testado',
};

export interface CreateCatRequest {
  name: string;
  photoUrl: string | null;
  roomId: number | null;
  roomTitle: string | null;
  sex: Sex | null;
  estimatedBirthDate: string | null;
  ageGroup: AgeGroup | null;
  coat: string | null;
  weightKg: number | null;
  characteristics: string | null;
  generalStatus: GeneralStatus | null;
  healthStatus: HealthStatus;
  fivFelvExamDate: string | null;
  pifResult: PifResult;
  pifExamDate: string | null;
  severity: Severity | null;
  neuteringStatus: NeuteringStatus | null;
  neuteringDate: string | null;
  microchip: string | null;
  rescueDate: string | null;
  foundConditions: string | null;
  sponsorName: string | null;
  sponsorPhone: string | null;
  sponsorFunding: string | null;
}

export interface Cat extends CreateCatRequest {
  id: number;
  photoUrl: string | null;
  roomTitle: string | null;
  createdAt: string;
}

export interface CatSearchParams {
  search?: string;
  roomId?: number;
  generalStatus?: GeneralStatus;
  page: number;
  size: number;
}

export interface PagedResult<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
