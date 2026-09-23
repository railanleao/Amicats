// Mirrors CreateCatInput on the backend (org.amicats.backend.domain.usecase.cat.create) and the
// mobile app's src/types/cat.ts, so the three clients speak the same wire format.
//
// Two deliberate deviations from the documented `gato` table (documentos/02-Especificação do
// Projeto.md), decided when the endpoint was implemented — see that doc's "Regras de decisão do
// modelo" section for the reasoning:
// - `fiv`/`felv`/`pif` are three independent fields, not the single combined `status_saude` enum.
// - `rescueLocation` ("Rua, bairro") has no matching column; the doc only has
//   `condicoes_encontrado` (conditions found, not a place).
export type CatSex = 'Male' | 'Female';
export type HealthTestResult = 'Positive' | 'Negative' | 'Untested';
export type NeuteredStatus = 'Yes' | 'No' | 'Scheduled';
export type CatClinicalStatus =
  | 'InTreatment'
  | 'AvailableForAdoption'
  | 'InTriage'
  | 'Adopted'
  | 'FosterHome'
  | 'InClinic'
  | 'Deceased'
  | 'Missing';

export const CAT_SEX_LABELS: Record<CatSex, string> = {
  Male: 'Macho',
  Female: 'Fêmea',
};

export const HEALTH_TEST_RESULT_LABELS: Record<HealthTestResult, string> = {
  Positive: 'Positivo',
  Negative: 'Negativo',
  Untested: 'Não testado',
};

export const NEUTERED_STATUS_LABELS: Record<NeuteredStatus, string> = {
  Yes: 'Sim',
  No: 'Não',
  Scheduled: 'Agendada',
};

export const CAT_CLINICAL_STATUS_LABELS: Record<CatClinicalStatus, string> = {
  InTreatment: 'Em tratamento',
  AvailableForAdoption: 'Disponível para adoção',
  InTriage: 'Em triagem',
  Adopted: 'Adotado',
  FosterHome: 'Lar temporário',
  InClinic: 'Em clínica',
  Deceased: 'Óbito',
  Missing: 'Desaparecido',
};

export interface CreateCatRequest {
  name: string;
  roomId: number | null;
  sex: CatSex | null;
  estimatedAge: string | null;
  coat: string | null;
  microchip: string | null;
  fiv: HealthTestResult | null;
  felv: HealthTestResult | null;
  pif: HealthTestResult | null;
  neutered: NeuteredStatus | null;
  clinicalStatus: CatClinicalStatus | null;
  healthNotes: string | null;
  rescueDate: string | null;
  rescueLocation: string | null;
  sponsorName: string | null;
  sponsorPhone: string | null;
  sponsorCoverage: string | null;
}

export interface Cat extends CreateCatRequest {
  id: number;
  createdAt: string;
  photoUrls: string[];
}

export interface CatPhoto {
  id: number;
  url: string;
}

// Just enough of Room to fill the "Sala atual" dropdown. A full room management page (with its
// own RoomService/Room model) is already approved in another PR — once it merges, this should be
// deleted in favor of that service instead of hitting /rooms directly from CatService.
export interface RoomOption {
  id: number;
  title: string;
}
