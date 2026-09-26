// Mirrors the backend's Cat domain (org.amicats.backend.domain.entity.Cat and CreateCatInput).
//
// CreateCatInput doesn't accept healthStatus, pifResult, severity, neuteringStatus, ageGroup,
// photoUrl or roomTitle: healthStatus/pifResult default to NotTested on creation, ageGroup is
// derived server-side from the birth date, and photoUrl/roomTitle aren't creation inputs (photo
// goes through a separate upload endpoint, roomTitle is looked up server-side from roomId). Those
// fields are only set later through separate clinical use cases (registerFivFelvExam,
// registerPifExam, updateSeverity, registerNeutering), none of which have an endpoint yet.
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

export const PIF_RESULT_LABELS: Record<PifResult, string> = {
  Positive: 'Positivo',
  Negative: 'Negativo',
  NotTested: 'Não testado',
};

export const NEUTERING_STATUS_LABELS: Record<NeuteringStatus, string> = {
  Neutered: 'Sim',
  NotNeutered: 'Não',
  Scheduled: 'Agendada',
};

export interface Cat {
  id: number;
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
  generalStatus: GeneralStatus;
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
  createdAt: string;
}

export interface CreateCatRequest {
  name: string;
  roomId: number | null;
  sex: Sex | null;
  estimatedBirthDate: string | null;
  coat: string | null;
  weightKg: number | null;
  characteristics: string | null;
  generalStatus: GeneralStatus | null;
  microchip: string | null;
  rescueDate: string | null;
  foundConditions: string | null;
  sponsorName: string | null;
  sponsorPhone: string | null;
  sponsorFunding: string | null;
}

export interface UpdateCatRequest {
  name: string;
  roomId: number | null;
  sex: Sex | null;
  estimatedBirthDate: string | null;
  coat: string | null;
  weightKg: number | null;
  characteristics: string | null;
  generalStatus: GeneralStatus | null;
  microchip: string | null;
  rescueDate: string | null;
  foundConditions: string | null;
  sponsorName: string | null;
  sponsorPhone: string | null;
  sponsorFunding: string | null;
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
