import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';

import { AuthService } from '../services/resources/auth.service';
import { termsAcceptanceGuard } from './terms-acceptance.guard';

describe('termsAcceptanceGuard', () => {
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
    return TestBed.runInInjectionContext(() =>
      termsAcceptanceGuard({} as never, {} as never),
    );
  }

  it('redirects to /login when unauthenticated', () => {
    authServiceSpy.isAuthenticated.and.returnValue(false);

    const result = runGuard() as UrlTree;

    expect(result).toEqual(router.parseUrl('/login'));
  });

  it('allows access while terms are still pending', () => {
    authServiceSpy.isAuthenticated.and.returnValue(true);
    authServiceSpy.termsAccepted.and.returnValue(false);

    expect(runGuard()).toBeTrue();
  });

  it('redirects to /definir-nova-senha when terms are already accepted but a password change is pending', () => {
    authServiceSpy.isAuthenticated.and.returnValue(true);
    authServiceSpy.termsAccepted.and.returnValue(true);
    authServiceSpy.mustChangePassword.and.returnValue(true);

    const result = runGuard() as UrlTree;

    expect(result).toEqual(router.parseUrl('/definir-nova-senha'));
  });

  it('redirects to / when onboarding is fully complete', () => {
    authServiceSpy.isAuthenticated.and.returnValue(true);
    authServiceSpy.termsAccepted.and.returnValue(true);
    authServiceSpy.mustChangePassword.and.returnValue(false);

    const result = runGuard() as UrlTree;

    expect(result).toEqual(router.parseUrl('/'));
  });
});
