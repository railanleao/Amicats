import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { PrescribedMedication } from '../../models/medical-prescription.model';

@Injectable({ providedIn: 'root' })
export class PrescribedMedicationService {
  private readonly http = inject(HttpClient);

  listActive(catId: number): Observable<PrescribedMedication[]> {
    return this.http.get<PrescribedMedication[]>(
      `/cats/${catId}/prescribed-medications/active`,
    );
  }

  cancel(id: number, reason: string): Observable<PrescribedMedication> {
    return this.http.patch<PrescribedMedication>(
      `/prescribed-medications/${id}/cancel`,
      { reason },
    );
  }
}
