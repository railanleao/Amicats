import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';

import { AuthService } from '../services/resources/auth.service';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', [
      'isAuthenticated',
      'termsAccepted',
      'mustChangePassword',
    ]);

    TestBed.configureTestingModule({
      providers: [{ provide: AuthService, useValue: authServiceSpy }],
    });

    router = TestBed.inject(Router);
  });

  function runGuard() {
    return TestBed.runInInjectionContext(() => authGuard({} as never, {} as never));
  }

  it('redirects to /login when unauthenticated', () => {
    authServiceSpy.isAuthenticated.and.returnValue(false);

    const result = runGuard() as UrlTree;

    expect(result).toEqual(router.parseUrl('/login'));
  });

  it('redirects to /termos-de-uso when terms are pending', () => {
    authServiceSpy.isAuthenticated.and.returnValue(true);
    authServiceSpy.termsAccepted.and.returnValue(false);

    const result = runGuard() as UrlTree;

    expect(result).toEqual(router.parseUrl('/termos-de-uso'));
  });

  it('redirects to /definir-nova-senha when a password change is pending', () => {
    authServiceSpy.isAuthenticated.and.returnValue(true);
    authServiceSpy.termsAccepted.and.returnValue(true);
    authServiceSpy.mustChangePassword.and.returnValue(true);

    const result = runGuard() as UrlTree;

    expect(result).toEqual(router.parseUrl('/definir-nova-senha'));
  });

  it('allows access once onboarding is complete', () => {
    authServiceSpy.isAuthenticated.and.returnValue(true);
    authServiceSpy.termsAccepted.and.returnValue(true);
    authServiceSpy.mustChangePassword.and.returnValue(false);

    expect(runGuard()).toBeTrue();
  });
});
