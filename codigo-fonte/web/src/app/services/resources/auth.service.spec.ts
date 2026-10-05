import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { LoginResponse } from '../../models/auth.model';
import { apiUrlInterceptor } from '../http/api-url.interceptor';
import { AuthService } from './auth.service';

describe('AuthService (integration)', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    sessionStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([apiUrlInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    sessionStorage.clear();
  });

  it('posts credentials to the configured API URL and stores the session on success', () => {
    const credentials = {
      email: 'marina.alves@amicats.org.br',
      password: 'senha-forte',
    };
    const mockResponse: LoginResponse = {
      token: 'fake-jwt-token',
      id: 1,
      name: 'Marina Alves',
      accessType: 'Assistant',
      termsAccepted: false,
      mustChangePassword: true,
    };

    let receivedResponse: LoginResponse | undefined;
    service
      .login(credentials)
      .subscribe((response) => (receivedResponse = response));

    const request = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(credentials);

    request.flush(mockResponse);

    expect(receivedResponse).toEqual(mockResponse);
    expect(service.getToken()).toBe(mockResponse.token);
    expect(service.isAuthenticated()).toBeTrue();
    expect(service.currentUser()).toEqual({
      id: mockResponse.id,
      name: mockResponse.name,
      accessType: mockResponse.accessType,
    });
    expect(service.termsAccepted()).toBeFalse();
    expect(service.mustChangePassword()).toBeTrue();
  });

  it('posts to /auth/accept-terms and updates the onboarding flags on success', () => {
    const mockResponse: LoginResponse = {
      token: 'fake-jwt-token-2',
      id: 1,
      name: 'Marina Alves',
      accessType: 'Assistant',
      termsAccepted: true,
      mustChangePassword: true,
    };

    let receivedResponse: LoginResponse | undefined;
    service
      .acceptTerms()
      .subscribe((response) => (receivedResponse = response));

    const request = httpMock.expectOne(
      `${environment.apiUrl}/auth/accept-terms`,
    );
    expect(request.request.method).toBe('POST');

    request.flush(mockResponse);

    expect(receivedResponse).toEqual(mockResponse);
    expect(service.getToken()).toBe(mockResponse.token);
    expect(service.termsAccepted()).toBeTrue();
    expect(service.mustChangePassword()).toBeTrue();
  });

  it('sends a PATCH to /auth/change-password and updates the onboarding flags on success', () => {
    const request_ = {
      currentPassword: 'senha-temporaria',
      newPassword: 'senha-nova-forte',
      confirmNewPassword: 'senha-nova-forte',
    };
    const mockResponse: LoginResponse = {
      token: 'fake-jwt-token-3',
      id: 1,
      name: 'Marina Alves',
      accessType: 'Assistant',
      termsAccepted: true,
      mustChangePassword: false,
    };

    let receivedResponse: LoginResponse | undefined;
    service
      .changePassword(request_)
      .subscribe((response) => (receivedResponse = response));

    const request = httpMock.expectOne(
      `${environment.apiUrl}/auth/change-password`,
    );
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual(request_);

    request.flush(mockResponse);

    expect(receivedResponse).toEqual(mockResponse);
    expect(service.getToken()).toBe(mockResponse.token);
    expect(service.mustChangePassword()).toBeFalse();
  });

  it('propagates a network error without storing a session', () => {
    const credentials = {
      email: 'marina.alves@amicats.org.br',
      password: 'senha-forte',
    };

    let receivedError: unknown;
    service.login(credentials).subscribe({
      error: (error) => (receivedError = error),
    });

    const request = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    request.error(new ProgressEvent('network error'));

    expect(receivedError).toBeTruthy();
    expect(service.getToken()).toBeNull();
    expect(service.currentUser()).toBeNull();
    expect(service.isAuthenticated()).toBeFalse();
  });

  it('posts to /auth/forgot-password and does not touch the session', () => {
    const request_ = { email: 'marina.alves@amicats.org.br' };

    let completed = false;
    service.forgotPassword(request_).subscribe(() => (completed = true));

    const request = httpMock.expectOne(
      `${environment.apiUrl}/auth/forgot-password`,
    );
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(request_);

    request.flush(null, { status: 204, statusText: 'No Content' });

    expect(completed).toBeTrue();
    expect(service.isAuthenticated()).toBeFalse();
  });

  it('restores the session from a previous page load', () => {
    const mockResponse: LoginResponse = {
      token: 'fake-jwt-token-4',
      id: 2,
      name: 'Carla Souza',
      accessType: 'Veterinarian',
      termsAccepted: true,
      mustChangePassword: false,
    };

    service
      .login({ email: 'carla@amicats.org.br', password: 'senha-forte' })
      .subscribe();
    httpMock.expectOne(`${environment.apiUrl}/auth/login`).flush(mockResponse);

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([apiUrlInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    const restoredService = TestBed.inject(AuthService);

    expect(restoredService.getToken()).toBe(mockResponse.token);
    expect(restoredService.isAuthenticated()).toBeTrue();
    expect(restoredService.currentUser()).toEqual({
      id: mockResponse.id,
      name: mockResponse.name,
      accessType: mockResponse.accessType,
    });
    expect(restoredService.termsAccepted()).toBeTrue();
    expect(restoredService.mustChangePassword()).toBeFalse();
  });

  it('starts with no session when storage is empty', () => {
    expect(service.getToken()).toBeNull();
    expect(service.isAuthenticated()).toBeFalse();
  });

  it('ignores corrupted session data left in storage', () => {
    sessionStorage.setItem('amicats.session', '{not-json');

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([apiUrlInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    const restoredService = TestBed.inject(AuthService);

    expect(restoredService.isAuthenticated()).toBeFalse();
  });

  it('removes the persisted session on clearSession', () => {
    const mockResponse: LoginResponse = {
      token: 'fake-jwt-token-5',
      id: 3,
      name: 'Marina Alves',
      accessType: 'Assistant',
      termsAccepted: true,
      mustChangePassword: false,
    };

    service
      .login({ email: 'marina.alves@amicats.org.br', password: 'senha-forte' })
      .subscribe();
    httpMock.expectOne(`${environment.apiUrl}/auth/login`).flush(mockResponse);

    service.clearSession();

    expect(sessionStorage.getItem('amicats.session')).toBeNull();

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([apiUrlInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    const restoredService = TestBed.inject(AuthService);

    expect(restoredService.isAuthenticated()).toBeFalse();
  });
});
