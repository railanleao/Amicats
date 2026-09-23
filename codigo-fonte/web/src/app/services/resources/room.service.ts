import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { PagedResult, Room, RoomSearchParams } from '../../models/room.model';

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
}
