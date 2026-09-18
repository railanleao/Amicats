import { HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthService } from '../resources/auth.service';
import { authErrorInterceptor } from './auth-error.interceptor';

describe('authErrorInterceptor', () => {
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', ['clearSession']);

    TestBed.configureTestingModule({
      providers: [{ provide: AuthService, useValue: authServiceSpy }],
    });

    router = TestBed.inject(Router);
    spyOn(router, 'navigateByUrl').and.resolveTo(true);
  });

  function run(url: string, status: number) {
    const request = new HttpRequest('GET', url);
    const next = jasmine
      .createSpy('next')
      .and.returnValue(throwError(() => new HttpErrorResponse({ status, url })));

    let receivedError: unknown;
    TestBed.runInInjectionContext(() =>
      authErrorInterceptor(request, next).subscribe({
        error: (error) => (receivedError = error),
      }),
    );

    return receivedError;
  }

  it('clears the session and redirects to /login on a 401 from a protected endpoint', () => {
    run(`${environment.apiUrl}/users`, 401);

    expect(authServiceSpy.clearSession).toHaveBeenCalled();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/login');
  });

  it('does not clear the session or redirect for a 401 on /auth/login itself', () => {
    run(`${environment.apiUrl}/auth/login`, 401);

    expect(authServiceSpy.clearSession).not.toHaveBeenCalled();
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });

  it('does not clear the session for other error statuses', () => {
    run(`${environment.apiUrl}/auth/change-password`, 400);

    expect(authServiceSpy.clearSession).not.toHaveBeenCalled();
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });

  it('still propagates the error to the caller', () => {
    const receivedError = run(`${environment.apiUrl}/users`, 401);

    expect(receivedError).toBeInstanceOf(HttpErrorResponse);
  });
});
