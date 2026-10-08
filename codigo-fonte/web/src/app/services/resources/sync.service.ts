import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { SyncDevice } from '../../models/sync.model';

@Injectable({ providedIn: 'root' })
export class SyncService {
  private readonly http = inject(HttpClient);

  listDevices(): Observable<SyncDevice[]> {
    return this.http.get<SyncDevice[]>('/sync/devices');
  }
}
