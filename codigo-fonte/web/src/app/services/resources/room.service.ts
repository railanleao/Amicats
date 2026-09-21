import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import {
  CreateRoomRequest,
  Room,
  RoomSearchParams,
  UpdateRoomRequest,
} from '../../models/room.model';
import { PagedResult } from '../../models/user.model';

@Injectable({ providedIn: 'root' })
export class RoomService {
  private readonly http = inject(HttpClient);

  list(params: RoomSearchParams): Observable<PagedResult<Room>> {
    let httpParams = new HttpParams().set('page', params.page).set('size', params.size);

    if (params.search) {
      httpParams = httpParams.set('search', params.search);
    }
    if (params.active !== undefined) {
      httpParams = httpParams.set('active', params.active);
    }

    return this.http.get<PagedResult<Room>>('/rooms', { params: httpParams });
  }

  findById(id: number): Observable<Room> {
    return this.http.get<Room>(`/rooms/${id}`);
  }

  create(request: CreateRoomRequest): Observable<Room> {
    return this.http.post<Room>('/rooms', request);
  }

  update(id: number, request: UpdateRoomRequest): Observable<Room> {
    return this.http.put<Room>(`/rooms/${id}`, request);
  }

  deactivate(id: number): Observable<void> {
    return this.setActive(id, false);
  }

  activate(id: number): Observable<void> {
    return this.setActive(id, true);
  }

  private setActive(id: number, active: boolean): Observable<void> {
    return this.http.patch<void>(`/rooms/${id}/status`, { active });
  }
}
