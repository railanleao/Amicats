import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Cat, CreateCatRequest } from '../../models/cat.model';

@Injectable({ providedIn: 'root' })
export class CatService {
  private readonly http = inject(HttpClient);

  create(request: CreateCatRequest): Observable<Cat> {
    return this.http.post<Cat>('/cats', request);
  }

  uploadPhoto(catId: number, file: File): Observable<Cat> {
    const body = new FormData();
    body.append('file', file);
    return this.http.put<Cat>(`/cats/${catId}/photo`, body);
  }
}
