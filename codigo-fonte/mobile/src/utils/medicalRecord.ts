import type {StatusBadgeTone} from '../components';
import type {Cat, HealthStatus, PifResult} from '../types/cat';
import {SEX_LABELS} from '../types/cat';
import type {PrescribedMedication} from '../types/medicalPrescription';
import {ADMINISTRATION_ROUTE_LABELS} from '../types/medicalPrescription';
import {calculateAgeYears} from './date';

export interface ClinicalBadge {
  label: string;
  tone: StatusBadgeTone;
}

const ADULT_AGE_YEARS = 1;

const HEALTH_STATUS_BADGES: Record<HealthStatus, ClinicalBadge> = {
  Healthy: { label: 'Saudável', tone: 'success' },
  Fiv: { label: 'FIV+', tone: 'danger' },
  Felv: { label: 'FeLV+', tone: 'danger' },
  FivFelv: { label: 'FIV+/FeLV+', tone: 'danger' },
  NotTested: { label: 'Não testado', tone: 'neutral' },
};

const PIF_BADGES: Record<PifResult, ClinicalBadge> = {
  Positive: { label: 'PIF+', tone: 'danger' },
  Negative: { label: 'PIF−', tone: 'success' },
  NotTested: { label: 'PIF não testado', tone: 'neutral' },
};

export function roomLabel(cat: Cat): string {
  if (cat.roomTitle) {
    return cat.roomTitle;
  }
  return cat.generalStatus === 'TemporaryHome' ? 'Lar temporário' : '—';
}

export function ageGroupLabel(cat: Cat): string | null {
  if (!cat.estimatedBirthDate) {
    return null;
  }
  return calculateAgeYears(cat.estimatedBirthDate) < ADULT_AGE_YEARS ? 'Filhote' : 'Adulto';
}

export function weightLabel(cat: Cat): string {
  return cat.weightKg != null ? `${String(cat.weightKg).replace('.', ',')} kg` : '—';
}

export function testedExamBadges(cat: Cat): ClinicalBadge[] {
  const badges: ClinicalBadge[] = [];
  if (cat.healthStatus !== 'NotTested') {
    badges.push(HEALTH_STATUS_BADGES[cat.healthStatus]);
  }
  if (cat.pifResult !== 'NotTested') {
    badges.push(PIF_BADGES[cat.pifResult]);
  }
  return badges;
}

export function medicalRecordSubtitle(cat: Cat): string {
  const health = cat.healthStatus !== 'NotTested' ? HEALTH_STATUS_BADGES[cat.healthStatus].label : null;
  return [cat.sex ? SEX_LABELS[cat.sex] : null, ageGroupLabel(cat), health].filter(Boolean).join(' · ');
}

function retroviralBadge(status: HealthStatus, positiveFor: HealthStatus[]): ClinicalBadge {
  if (status === 'NotTested') {
    return { label: 'Não testado', tone: 'neutral' };
  }
  return positiveFor.includes(status)
    ? { label: 'Positivo', tone: 'danger' }
    : { label: 'Negativo', tone: 'success' };
}

export function fivBadge(status: HealthStatus): ClinicalBadge {
  return retroviralBadge(status, ['Fiv', 'FivFelv']);
}

export function felvBadge(status: HealthStatus): ClinicalBadge {
  return retroviralBadge(status, ['Felv', 'FivFelv']);
}

export function neuteredLabel(cat: Cat): string {
  switch (cat.neuteringStatus) {
    case 'Neutered':
      return 'Sim';
    case 'Scheduled':
      return 'Agendada';
    case 'NotNeutered':
      return 'Não';
    default:
      return '—';
  }
}

export function medicationSchedule(medication: PrescribedMedication): string {
  return `${medication.dosage} · ${ADMINISTRATION_ROUTE_LABELS[medication.route]} · a cada ${medication.intervalHours}h`;
}
