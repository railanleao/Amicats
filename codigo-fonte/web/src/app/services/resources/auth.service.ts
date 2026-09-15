import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { LoginRequest, LoginResponse, User } from '../../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly token = signal<string | null>(null);
  private readonly user = signal<User | null>(null);

  readonly currentUser = this.user.asReadonly();

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>('/auth/login', credentials)
      .pipe(tap((response) => this.setSession(response)));
  }

  setSession(response: LoginResponse): void {
    this.token.set(response.token);
    this.user.set(response.user);
  }

  getToken(): string | null {
    return this.token();
  }

  clearSession(): void {
    this.token.set(null);
    this.user.set(null);
  }
}
