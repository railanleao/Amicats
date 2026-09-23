import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import {
  Cat,
  CatPhoto,
  CreateCatRequest,
  RoomOption,
} from '../../models/cat.model';
import { PagedResult } from '../../models/user.model';

@Injectable({ providedIn: 'root' })
export class CatService {
  private readonly http = inject(HttpClient);

  create(request: CreateCatRequest): Observable<Cat> {
    return this.http.post<Cat>('/cats', request);
  }

  findById(id: number): Observable<Cat> {
    return this.http.get<Cat>(`/cats/${id}`);
  }

  uploadPhoto(catId: number, file: File): Observable<CatPhoto> {
    const body = new FormData();
    body.append('file', file);
    return this.http.post<CatPhoto>(`/cats/${catId}/photos`, body);
  }

  // TODO: replace with a real RoomService once the room management page (approved, not yet
  // merged into this branch) ships — see the note on RoomOption in cat.model.ts.
  listActiveRooms(): Observable<RoomOption[]> {
    const params = new HttpParams().set('active', true).set('size', 100);
    return this.http
      .get<PagedResult<RoomOption>>('/rooms', { params })
      .pipe(map((page) => page.content));
  }
}
