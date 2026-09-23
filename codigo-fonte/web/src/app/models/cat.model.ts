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

export const AGE_GROUP_LABELS: Record<AgeGroup, string> = {
  Kitten: 'Filhote',
  Young: 'Jovem',
  Adult: 'Adulto',
  Senior: 'Sênior',
};

export const GENERAL_STATUS_LABELS: Record<GeneralStatus, string> = {
  UnderTreatment: 'Em Tratamento',
  AvailableForAdoption: 'Disponível p/ Adoção',
  InTriage: 'Em Triagem',
  Adopted: 'Adotado',
  TemporaryHome: 'Lar Temporário',
  InClinic: 'Em Clínica',
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
