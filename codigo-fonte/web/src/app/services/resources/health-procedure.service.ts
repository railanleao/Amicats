import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { PagedResult } from '../../models/paged-result.model';
import {
  CancelHealthProcedureRequest,
  CatHealthSummary,
  CompleteHealthProcedureRequest,
  CreateHealthProcedureRequest,
  HealthProcedure,
  HealthProcedureChange,
  HealthProcedureSearchParams,
  UpdateHealthProcedureRequest,
} from '../../models/health-procedure.model';

@Injectable({ providedIn: 'root' })
export class HealthProcedureService {
  private readonly http = inject(HttpClient);

  list(
    params: HealthProcedureSearchParams,
  ): Observable<PagedResult<HealthProcedure>> {
    let httpParams = new HttpParams()
      .set('page', params.page)
      .set('size', params.size);

    if (params.search) {
      httpParams = httpParams.set('search', params.search);
    }
    if (params.catId !== undefined) {
      httpParams = httpParams.set('catId', params.catId);
    }
    if (params.type) {
      httpParams = httpParams.set('type', params.type);
    }
    if (params.status) {
      httpParams = httpParams.set('status', params.status);
    }

    return this.http.get<PagedResult<HealthProcedure>>('/health-procedures', {
      params: httpParams,
    });
  }

  findById(id: number): Observable<HealthProcedure> {
    return this.http.get<HealthProcedure>(`/health-procedures/${id}`);
  }

  listChanges(id: number): Observable<HealthProcedureChange[]> {
    return this.http.get<HealthProcedureChange[]>(
      `/health-procedures/${id}/changes`,
    );
  }

  summarize(catId: number): Observable<CatHealthSummary> {
    return this.http.get<CatHealthSummary>(`/cats/${catId}/health-summary`);
  }

  create(request: CreateHealthProcedureRequest): Observable<HealthProcedure> {
    return this.http.post<HealthProcedure>('/health-procedures', request);
  }

  update(
    id: number,
    request: UpdateHealthProcedureRequest,
  ): Observable<HealthProcedure> {
    return this.http.put<HealthProcedure>(`/health-procedures/${id}`, request);
  }

  complete(
    id: number,
    request: CompleteHealthProcedureRequest,
  ): Observable<HealthProcedure> {
    return this.http.patch<HealthProcedure>(
      `/health-procedures/${id}/complete`,
      request,
    );
  }

  cancel(
    id: number,
    request: CancelHealthProcedureRequest,
  ): Observable<HealthProcedure> {
    return this.http.patch<HealthProcedure>(
      `/health-procedures/${id}/cancel`,
      request,
    );
  }
}
