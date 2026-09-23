// Mirrors CreateCatInput on the backend (org.amicats.backend.domain.usecase.cat.create).
//
// Two deliberate deviations from the documented `gato` table (documentos/02-Especificação do
// Projeto.md), decided when the endpoint was implemented:
// - `fiv`/`felv`/`pif` are three independent fields, while the doc has a single combined
//   `status_saude` enum that can't represent a cat positive for more than one disease at once.
// - `rescueLocation` ("Rua, bairro") has no matching column; the doc only has
//   `condicoes_encontrado` (conditions found, not a place).
// The doc should be updated to match.
export type CatSex = 'Male' | 'Female';

export type HealthTestResult = 'Positive' | 'Negative' | 'Untested';

export type NeuteredStatus = 'Yes' | 'No' | 'Scheduled';

export type CatClinicalStatus =
  'InTreatment' | 'AvailableForAdoption' | 'InTriage' | 'Adopted' | 'FosterHome' | 'InClinic' | 'Deceased' | 'Missing';

export interface CreateCatRequest {
  name: string;
  roomId: number | null;
  sex: CatSex | null;
  estimatedAge: string;
  coat: string;
  microchip: string;
  fiv: HealthTestResult | null;
  felv: HealthTestResult | null;
  pif: HealthTestResult | null;
  neutered: NeuteredStatus | null;
  clinicalStatus: CatClinicalStatus | null;
  healthNotes: string;
  rescueDate: string;
  rescueLocation: string;
  sponsorName: string;
  sponsorPhone: string;
  sponsorCoverage: string;
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
