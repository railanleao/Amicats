import { HttpRequest } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthService } from '../resources/auth.service';
import { authTokenInterceptor } from './auth-token.interceptor';

describe('authTokenInterceptor', () => {
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', ['getToken']);

    TestBed.configureTestingModule({
      providers: [{ provide: AuthService, useValue: authServiceSpy }],
    });
  });

  it('attaches the Bearer token to a request targeting the API', () => {
    authServiceSpy.getToken.and.returnValue('fake-jwt-token');
    const request = new HttpRequest('GET', `${environment.apiUrl}/users`);
    const next = jasmine.createSpy('next').and.returnValue(of());

    TestBed.runInInjectionContext(() => authTokenInterceptor(request, next));

    const forwardedRequest = next.calls.mostRecent().args[0] as HttpRequest<unknown>;
    expect(forwardedRequest.headers.get('Authorization')).toBe('Bearer fake-jwt-token');
  });

  it('does not attach a header when there is no token', () => {
    authServiceSpy.getToken.and.returnValue(null);
    const request = new HttpRequest('GET', `${environment.apiUrl}/users`);
    const next = jasmine.createSpy('next').and.returnValue(of());

    TestBed.runInInjectionContext(() => authTokenInterceptor(request, next));

    expect(next).toHaveBeenCalledWith(request);
  });

  it('does not leak the token to a third-party absolute URL', () => {
    authServiceSpy.getToken.and.returnValue('fake-jwt-token');
    const request = new HttpRequest('GET', 'https://third-party.example.com/track');
    const next = jasmine.createSpy('next').and.returnValue(of());

    TestBed.runInInjectionContext(() => authTokenInterceptor(request, next));

    expect(next).toHaveBeenCalledWith(request);
  });
});
