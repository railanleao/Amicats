import {
  HEALTH_PROCEDURE_STATUS_LABELS,
  HEALTH_PROCEDURE_TYPE_LABELS,
  HealthProcedure,
} from '../models/health-procedure.model';

export type HealthProcedureTone =
  'scheduled' | 'completed' | 'cancelled' | 'overdue';

const MANAGER_ACCESS_TYPES = new Set([
  'Administrator',
  'Veterinarian',
  'Assistant',
]);

export function canManageHealthProcedures(
  accessType: string | undefined,
): boolean {
  return !!accessType && MANAGER_ACCESS_TYPES.has(accessType);
}

export function healthProcedureName(procedure: HealthProcedure): string {
  return procedure.name ?? HEALTH_PROCEDURE_TYPE_LABELS[procedure.type];
}

export function healthProcedureStatusLabel(procedure: HealthProcedure): string {
  return procedure.overdue
    ? 'Atrasado'
    : HEALTH_PROCEDURE_STATUS_LABELS[procedure.status];
}

export function healthProcedureTone(
  procedure: HealthProcedure,
): HealthProcedureTone {
  if (procedure.overdue) {
    return 'overdue';
  }
  switch (procedure.status) {
    case 'Completed':
      return 'completed';
    case 'Cancelled':
      return 'cancelled';
    default:
      return 'scheduled';
  }
}

export function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addMonthsToIsoDate(isoDate: string, months: number): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  const target = new Date(year, month - 1 + months, 1);
  const lastDay = new Date(
    target.getFullYear(),
    target.getMonth() + 1,
    0,
  ).getDate();
  target.setDate(Math.min(day, lastDay));
  return toIsoDate(target);
}

export function formatIsoDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
}

export function asUtc(dateTime: string): string {
  return /(Z|[+-]\d{2}:\d{2})$/.test(dateTime) ? dateTime : `${dateTime}Z`;
}
