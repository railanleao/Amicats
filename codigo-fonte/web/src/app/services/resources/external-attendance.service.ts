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
    const data = new FormData();
    data.append(
      'data',
      new Blob(
        [
          JSON.stringify({
            partnerClinic: request.partnerClinic,
            veterinarian: request.veterinarian,
            crmv: request.crmv,
            attendanceDate: request.attendanceDate,
            diagnosis: request.diagnosis,
          }),
        ],
        { type: 'application/json' },
      ),
    );
    data.append('file', request.file);

    return this.http.post<ExternalAttendance>(
      `/cats/${request.catId}/external-attendances`,
      data,
    );
  }

  listByCat(catId: number): Observable<ExternalAttendance[]> {
    return this.http.get<ExternalAttendance[]>(
      `/cats/${catId}/external-attendances`,
    );
  }

  attachment(id: number): Observable<Blob> {
    return this.http.get(`/external-attendances/${id}/attachment`, {
      responseType: 'blob',
    });
  }
}
