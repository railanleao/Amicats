import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import {
  CreateUserRequest,
  PagedResult,
  UpdateUserRequest,
  User,
  UserSearchParams,
} from '../../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);

  list(params: UserSearchParams): Observable<PagedResult<User>> {
    let httpParams = new HttpParams()
      .set('page', params.page)
      .set('size', params.size);

    if (params.search) {
      httpParams = httpParams.set('search', params.search);
    }
    if (params.accessType) {
      httpParams = httpParams.set('accessType', params.accessType);
    }
    if (params.active !== undefined) {
      httpParams = httpParams.set('active', params.active);
    }

    return this.http.get<PagedResult<User>>('/users', { params: httpParams });
  }

  findById(id: number): Observable<User> {
    return this.http.get<User>(`/users/${id}`);
  }

  create(request: CreateUserRequest): Observable<User> {
    return this.http.post<User>('/users', request);
  }

  update(id: number, request: UpdateUserRequest): Observable<User> {
    return this.http.put<User>(`/users/${id}`, request);
  }

  deactivate(id: number): Observable<void> {
    return this.setActive(id, false);
  }

  activate(id: number): Observable<void> {
    return this.setActive(id, true);
  }

  uploadPhoto(id: number, file: File): Observable<User> {
    const body = new FormData();
    body.append('file', file);
    return this.http.put<User>(`/users/${id}/photo`, body);
  }

  photo(id: number): Observable<Blob> {
    return this.http.get(`/users/${id}/photo`, { responseType: 'blob' });
  }

  removePhoto(id: number): Observable<void> {
    return this.http.delete<void>(`/users/${id}/photo`);
  }

  private setActive(id: number, active: boolean): Observable<void> {
    return this.http.patch<void>(`/users/${id}/status`, { active });
  }
}
