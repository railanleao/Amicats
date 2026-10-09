import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Cat } from '../../models/cat.model';
import {
  CreateRoomTransferRequest,
  RoomTransfer,
} from '../../models/room-transfer.model';

@Injectable({ providedIn: 'root' })
export class RoomTransferService {
  private readonly http = inject(HttpClient);

  create(catId: number, request: CreateRoomTransferRequest): Observable<Cat> {
    return this.http.post<Cat>(`/cats/${catId}/room-transfers`, request);
  }

  list(catId: number): Observable<RoomTransfer[]> {
    return this.http.get<RoomTransfer[]>(`/cats/${catId}/room-transfers`);
  }
}
