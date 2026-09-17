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
});
