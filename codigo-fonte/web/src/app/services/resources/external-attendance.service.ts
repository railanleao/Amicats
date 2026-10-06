import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  CreateExternalAttendanceRequest,
  ExternalAttendance,
} from '../../models/external-attendance.model';

@Injectable({ providedIn: 'root' })
export class ExternalAttendanceService {
  private readonly http = inject(HttpClient);

  create(
    request: CreateExternalAttendanceRequest,
  ): Observable<ExternalAttendance> {
    return this.http.post<ExternalAttendance>('/external-attendances', request);
  }

  listByCat(catId: number): Observable<ExternalAttendance[]> {
    return this.http.get<ExternalAttendance[]>(
      `/external-attendances/cat/${catId}`,
    );
  }

  listClinics(): Observable<string[]> {
    return this.http.get<string[]>('/external-attendances/clinics');
  }
}
