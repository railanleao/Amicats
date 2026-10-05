// Mirrors the backend's Cat domain (org.amicats.backend.domain.entity.Cat and
// CreateCatInput). A colleague built the entity, listing, search and cover-photo endpoints in a
// separate task; this only adds the create request shape on top of it.
//
// CreateCatInput doesn't accept healthStatus, pifResult, severity or neuteringStatus — those are
// set later through separate clinical use cases (registerFivFelvExam, registerPifExam,
// updateSeverity, registerNeutering), none of which have an endpoint yet. "Situação clínica" is
// the only health-ish field this form can actually submit. The cat detail screen (ficha) reads
// them, though, since the backend already returns them on every GET /cats response.
export type Sex = 'Male' | 'Female';

export type HealthStatus = 'Healthy' | 'Fiv' | 'Felv' | 'FivFelv' | 'NotTested';

export type PifResult = 'Positive' | 'Negative' | 'NotTested';

export type NeuteringStatus = 'Neutered' | 'NotNeutered' | 'Scheduled';

export type GeneralStatus =
  'UnderTreatment' | 'AvailableForAdoption' | 'InTriage' | 'Adopted' | 'TemporaryHome' | 'InClinic' | 'Deceased' | 'Missing';

export const SEX_LABELS: Record<Sex, string> = {
  Male: 'Macho',
  Female: 'Fêmea',
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

export const GENERAL_STATUS_TONE: Record<
  GeneralStatus,
  'warning' | 'danger' | 'success' | 'sky' | 'neutral'
> = {
  UnderTreatment: 'warning',
  AvailableForAdoption: 'success',
  InTriage: 'sky',
  Adopted: 'success',
  TemporaryHome: 'neutral',
  InClinic: 'danger',
  Deceased: 'neutral',
  Missing: 'warning',
};

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

export interface Cat extends CreateCatRequest {
  id: number;
  photoUrl: string | null;
  roomTitle: string | null;
  healthStatus: HealthStatus;
  pifResult: PifResult;
  neuteringStatus: NeuteringStatus | null;
  createdAt: string;
}
