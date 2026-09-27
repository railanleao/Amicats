import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  Cat,
  CatSearchParams,
  CreateCatRequest,
  PagedResult,
  UpdateCatRequest,
} from '../../models/cat.model';

@Injectable({ providedIn: 'root' })
export class CatService {
  private readonly http = inject(HttpClient);

  list(params: CatSearchParams): Observable<PagedResult<Cat>> {
    let httpParams = new HttpParams()
      .set('page', params.page)
      .set('size', params.size);

    if (params.search) {
      httpParams = httpParams.set('search', params.search);
    }
    if (params.roomId !== undefined) {
      httpParams = httpParams.set('roomId', params.roomId);
    }
    if (params.generalStatus) {
      httpParams = httpParams.set('generalStatus', params.generalStatus);
    }

    return this.http.get<PagedResult<Cat>>('/cats', { params: httpParams });
  }

  findById(id: number): Observable<Cat> {
    return this.http.get<Cat>(`/cats/${id}`);
  }

  create(request: CreateCatRequest): Observable<Cat> {
    return this.http.post<Cat>('/cats', request);
  }

  update(id: number, request: UpdateCatRequest): Observable<Cat> {
    return this.http.put<Cat>(`/cats/${id}`, request);
  }

  uploadPhoto(catId: number, file: File): Observable<Cat> {
    const body = new FormData();
    body.append('file', file);
    return this.http.put<Cat>(`/cats/${catId}/photo`, body);
  }

  photo(id: number): Observable<Blob> {
    return this.http.get(`/cats/${id}/photo`, { responseType: 'blob' });
  }

  removePhoto(id: number): Observable<void> {
    return this.http.delete<void>(`/cats/${id}/photo`);
  }
}
