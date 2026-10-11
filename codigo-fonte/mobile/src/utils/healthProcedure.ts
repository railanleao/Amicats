import type { StatusBadgeTone } from '../components';
import type { AccessType } from '../types/auth';
import type { HealthProcedure, HealthProcedureChange, HealthProcedureField } from '../types/healthProcedure';
import {
  HEALTH_PROCEDURE_FIELD_LABELS,
  HEALTH_PROCEDURE_STATUS_LABELS,
  HEALTH_PROCEDURE_TYPE_LABELS,
} from '../types/healthProcedure';
import { formatBrazilianDate, parseBrazilianDate } from './date';

const BUSINESS_TIME_ZONE = 'America/Campo_Grande';
const MANAGER_ACCESS_TYPES: AccessType[] = ['Administrator', 'Veterinarian', 'Assistant'];
const DATE_FIELDS: HealthProcedureField[] = ['ScheduledDate', 'CompletedDate'];
const HAS_OFFSET = /(Z|[+-]\d{2}:?\d{2})$/;

export type BoosterOption = 'threeMonths' | 'oneYear' | 'custom';

export const BOOSTER_OPTIONS: { value: BoosterOption; label: string }[] = [
  { value: 'threeMonths', label: 'Em 3 meses' },
  { value: 'oneYear', label: 'Em 1 ano' },
  { value: 'custom', label: 'Outra data' },
];

const BOOSTER_MONTHS: Record<Exclude<BoosterOption, 'custom'>, number> = {
  threeMonths: 3,
  oneYear: 12,
};

export function canManageHealthProcedures(accessType: AccessType | undefined): boolean {
  return !!accessType && MANAGER_ACCESS_TYPES.includes(accessType);
}

export function healthProcedureName(procedure: HealthProcedure): string {
  return procedure.name ?? HEALTH_PROCEDURE_TYPE_LABELS[procedure.type];
}

export function healthProcedureStatusLabel(procedure: HealthProcedure): string {
  return procedure.overdue ? 'Atrasado' : HEALTH_PROCEDURE_STATUS_LABELS[procedure.status];
}

export function healthProcedureTone(procedure: HealthProcedure): StatusBadgeTone {
  if (procedure.overdue) {
    return 'danger';
  }
  switch (procedure.status) {
    case 'Completed':
      return 'success';
    case 'Cancelled':
      return 'neutral';
    default:
      return 'sky';
  }
}

export function healthProcedureDateLabel(procedure: HealthProcedure): string {
  return formatBrazilianDate(procedure.completedDate ?? procedure.scheduledDate);
}

export function todayIsoDate(now: Date = new Date()): string {
  const brazilianDate = new Intl.DateTimeFormat('pt-BR', {
    timeZone: BUSINESS_TIME_ZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(now);
  return parseBrazilianDate(brazilianDate) as string;
}

export function parseDateInput(value: string): string | null {
  const isoDate = parseBrazilianDate(value);
  if (!isoDate) {
    return null;
  }

  const [year, month, day] = isoDate.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  const isRealDate = date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
  return isRealDate ? isoDate : null;
}

export function addMonthsToIsoDate(isoDate: string, months: number): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  const target = new Date(Date.UTC(year, month - 1 + months, 1));
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(day, lastDay));
  return target.toISOString().slice(0, 10);
}

export function boosterDate(completedDate: string | null, option: BoosterOption, customDate: string | null): string | null {
  if (option === 'custom') {
    return customDate;
  }
  return completedDate ? addMonthsToIsoDate(completedDate, BOOSTER_MONTHS[option]) : null;
}

export function resolveBoosterDate(completedDateInput: string, option: BoosterOption, customDateInput: string): string | null {
  return boosterDate(parseDateInput(completedDateInput), option, parseDateInput(customDateInput));
}

export function isBoosterInPast(option: BoosterOption, date: string | null, today: string): boolean {
  return option !== 'custom' && date !== null && date < today;
}

export function validateProcedureName(value: string): true | string {
  return value.trim() !== '' || 'Informe o nome da vacina ou do vermífugo.';
}

export function validateScheduledDate(value: string, today: string, originalDate: string | null): true | string {
  const isoDate = parseDateInput(value);
  if (!isoDate) {
    return 'Informe uma data válida (dd/mm/aaaa).';
  }
  return isoDate === originalDate || isoDate >= today || 'A data agendada não pode estar no passado.';
}

export function validateCompletedDate(value: string, today: string): true | string {
  const isoDate = parseDateInput(value);
  if (!isoDate) {
    return 'Informe uma data válida (dd/mm/aaaa).';
  }
  return isoDate <= today || 'A data de realização não pode estar no futuro.';
}

export function validateBoosterDate(value: string, today: string): true | string {
  const isoDate = parseDateInput(value);
  if (!isoDate) {
    return 'Informe a data do reforço (dd/mm/aaaa).';
  }
  return isoDate >= today || 'A data do reforço não pode estar no passado.';
}

export function changeDescription(change: HealthProcedureChange): string | null {
  if (!change.field) {
    return null;
  }

  const label = HEALTH_PROCEDURE_FIELD_LABELS[change.field];
  const newValue = formatChangeValue(change.field, change.newValue);

  if (change.oldValue === null) {
    return `${label}: ${newValue}`;
  }
  return `${label}: ${formatChangeValue(change.field, change.oldValue)} → ${newValue}`;
}

export function formatChangedAt(changedAt: string): string {
  const date = new Date(HAS_OFFSET.test(changedAt) ? changedAt : `${changedAt}Z`);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${date.getFullYear()} ${hours}:${minutes}`;
}

function isApiError(error: unknown): error is { status?: number; message: string } {
  return error instanceof Error && 'status' in error;
}

export function healthProcedureErrorMessage(error: unknown, fallback: string): string {
  if (isApiError(error)) {
    switch (error.status) {
      case 400:
      case 409:
        return error.message;
      case 403:
        return 'Seu perfil não tem permissão para alterar agendamentos de saúde.';
      case 404:
        return 'O gatinho ou o agendamento não foi encontrado.';
    }
  }
  return fallback;
}

function formatChangeValue(field: HealthProcedureField, value: string | null): string {
  if (value === null) {
    return '—';
  }
  return DATE_FIELDS.includes(field) ? formatBrazilianDate(value) : value;
}
