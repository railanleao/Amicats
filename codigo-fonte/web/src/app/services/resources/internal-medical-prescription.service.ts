import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import {
  CreateInternalMedicalPrescriptionRequest,
  InternalMedicalPrescription,
} from '../../models/medical-prescription.model';

@Injectable({ providedIn: 'root' })
export class InternalMedicalPrescriptionService {
  private readonly http = inject(HttpClient);

  create(
    catId: number,
    request: CreateInternalMedicalPrescriptionRequest,
  ): Observable<InternalMedicalPrescription> {
    return this.http.post<InternalMedicalPrescription>(
      `/cats/${catId}/internal-medical-prescriptions`,
      request,
    );
  }
}
