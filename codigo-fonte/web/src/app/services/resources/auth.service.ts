import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import {
  ChangePasswordRequest,
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  User,
} from '../../models/auth.model';

interface StoredSession {
  token: string;
  user: User;
  termsAccepted: boolean;
  mustChangePassword: boolean;
}

const STORAGE_KEY = 'amicats.session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly token = signal<string | null>(null);
  private readonly user = signal<User | null>(null);
  private readonly termsAcceptedFlag = signal(false);
  private readonly mustChangePasswordFlag = signal(false);

  readonly currentUser = this.user.asReadonly();
  readonly isAuthenticated = computed(() => this.token() !== null);
  readonly termsAccepted = this.termsAcceptedFlag.asReadonly();
  readonly mustChangePassword = this.mustChangePasswordFlag.asReadonly();

  constructor() {
    this.restoreSession();
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>('/auth/login', credentials)
      .pipe(tap((response) => this.setSession(response)));
  }

  acceptTerms(): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>('/auth/accept-terms', {})
      .pipe(tap((response) => this.setSession(response)));
  }

  changePassword(request: ChangePasswordRequest): Observable<LoginResponse> {
    return this.http
      .patch<LoginResponse>('/auth/change-password', request)
      .pipe(tap((response) => this.setSession(response)));
  }

  forgotPassword(request: ForgotPasswordRequest): Observable<void> {
    return this.http.post<void>('/auth/forgot-password', request);
  }

  setSession(response: LoginResponse): void {
    const user: User = {
      id: response.id,
      name: response.name,
      accessType: response.accessType,
    };

    this.token.set(response.token);
    this.user.set(user);
    this.termsAcceptedFlag.set(response.termsAccepted);
    this.mustChangePasswordFlag.set(response.mustChangePassword);

    this.persistSession({
      token: response.token,
      user,
      termsAccepted: response.termsAccepted,
      mustChangePassword: response.mustChangePassword,
    });
  }

  getToken(): string | null {
    return this.token();
  }

  clearSession(): void {
    this.token.set(null);
    this.user.set(null);
    this.termsAcceptedFlag.set(false);
    this.mustChangePasswordFlag.set(false);
    sessionStorage.removeItem(STORAGE_KEY);
  }

  private persistSession(session: StoredSession): void {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }

  private restoreSession(): void {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return;
    }

    try {
      const session = JSON.parse(raw) as Partial<StoredSession>;
      if (!session.token || !session.user) {
        sessionStorage.removeItem(STORAGE_KEY);
        return;
      }

      this.token.set(session.token);
      this.user.set(session.user);
      this.termsAcceptedFlag.set(session.termsAccepted ?? false);
      this.mustChangePasswordFlag.set(session.mustChangePassword ?? false);
    } catch {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }
}
