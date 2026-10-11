export type HealthProcedureType = 'Vaccine' | 'Deworming' | 'Neutering';
export type HealthProcedureStatus = 'Scheduled' | 'Completed' | 'Cancelled';
export type HealthProcedureAction = 'Created' | 'Updated' | 'Completed' | 'Cancelled';
export type HealthProcedureField = 'Name' | 'ScheduledDate' | 'Notes' | 'CompletedDate' | 'CancelReason';

export const HEALTH_PROCEDURE_TYPE_LABELS: Record<HealthProcedureType, string> = {
  Vaccine: 'Vacina',
  Deworming: 'Vermífugo',
  Neutering: 'Castração',
};

export const HEALTH_PROCEDURE_STATUS_LABELS: Record<HealthProcedureStatus, string> = {
  Scheduled: 'Agendado',
  Completed: 'Realizado',
  Cancelled: 'Cancelado',
};

export const HEALTH_PROCEDURE_ACTION_LABELS: Record<HealthProcedureAction, string> = {
  Created: 'Agendamento criado',
  Updated: 'Agendamento editado',
  Completed: 'Marcado como realizado',
  Cancelled: 'Agendamento cancelado',
};

export const HEALTH_PROCEDURE_FIELD_LABELS: Record<HealthProcedureField, string> = {
  Name: 'Procedimento',
  ScheduledDate: 'Data agendada',
  Notes: 'Observações',
  CompletedDate: 'Data de realização',
  CancelReason: 'Motivo',
};

export interface HealthProcedure {
  id: number;
  catId: number;
  catName: string;
  type: HealthProcedureType;
  name: string | null;
  status: HealthProcedureStatus;
  overdue: boolean;
  scheduledDate: string;
  completedDate: string | null;
  notes: string | null;
  cancelReason: string | null;
  previousHealthProcedureId: number | null;
  createdByName: string;
  createdAt: string;
}

export interface HealthProcedureChange {
  id: number;
  action: HealthProcedureAction;
  field: HealthProcedureField | null;
  oldValue: string | null;
  newValue: string | null;
  userName: string;
  changedAt: string;
}

export interface HealthProcedureSearchParams {
  search?: string;
  catId?: number;
  type?: HealthProcedureType;
  status?: HealthProcedureStatus;
  page: number;
  size: number;
}

export interface CreateHealthProcedureRequest {
  catId: number;
  type: HealthProcedureType;
  name: string | null;
  scheduledDate: string;
  notes: string | null;
}

export interface UpdateHealthProcedureRequest {
  name: string | null;
  scheduledDate: string;
  notes: string | null;
}

export interface CompleteHealthProcedureRequest {
  completedDate: string;
  notes: string | null;
  boosterDate: string | null;
}

export interface CancelHealthProcedureRequest {
  reason: string;
}
