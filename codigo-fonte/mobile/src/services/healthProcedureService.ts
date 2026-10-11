import { apiRequest } from './api';
import type { PagedResult } from '../types/common';
import type {
  CancelHealthProcedureRequest,
  CompleteHealthProcedureRequest,
  CreateHealthProcedureRequest,
  HealthProcedure,
  HealthProcedureChange,
  HealthProcedureSearchParams,
  UpdateHealthProcedureRequest,
} from '../types/healthProcedure';

export function listHealthProcedures(params: HealthProcedureSearchParams): Promise<PagedResult<HealthProcedure>> {
  const query = new URLSearchParams();
  query.set('page', String(params.page));
  query.set('size', String(params.size));

  if (params.search) {
    query.set('search', params.search);
  }
  if (params.catId !== undefined) {
    query.set('catId', String(params.catId));
  }
  if (params.type) {
    query.set('type', params.type);
  }
  if (params.status) {
    query.set('status', params.status);
  }

  return apiRequest<PagedResult<HealthProcedure>>(`/health-procedures?${query.toString()}`);
}

export function getHealthProcedure(id: number): Promise<HealthProcedure> {
  return apiRequest<HealthProcedure>(`/health-procedures/${id}`);
}

export function listHealthProcedureChanges(id: number): Promise<HealthProcedureChange[]> {
  return apiRequest<HealthProcedureChange[]>(`/health-procedures/${id}/changes`);
}

export function createHealthProcedure(request: CreateHealthProcedureRequest): Promise<HealthProcedure> {
  return apiRequest<HealthProcedure>('/health-procedures', { method: 'POST', body: request });
}

export function updateHealthProcedure(id: number, request: UpdateHealthProcedureRequest): Promise<HealthProcedure> {
  return apiRequest<HealthProcedure>(`/health-procedures/${id}`, { method: 'PUT', body: request });
}

export function completeHealthProcedure(id: number, request: CompleteHealthProcedureRequest): Promise<HealthProcedure> {
  return apiRequest<HealthProcedure>(`/health-procedures/${id}/complete`, { method: 'PATCH', body: request });
}

export function cancelHealthProcedure(id: number, request: CancelHealthProcedureRequest): Promise<HealthProcedure> {
  return apiRequest<HealthProcedure>(`/health-procedures/${id}/cancel`, { method: 'PATCH', body: request });
}
