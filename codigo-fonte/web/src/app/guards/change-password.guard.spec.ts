import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';

import { AuthService } from '../services/resources/auth.service';
import { changePasswordGuard } from './change-password.guard';

describe('changePasswordGuard', () => {
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
    return TestBed.runInInjectionContext(() => changePasswordGuard({} as never, {} as never));
  }

  it('redirects to /login when unauthenticated', () => {
    authServiceSpy.isAuthenticated.and.returnValue(false);

    const result = runGuard() as UrlTree;

    expect(result).toEqual(router.parseUrl('/login'));
  });

  it('redirects to /termos-de-uso when terms are still pending', () => {
    authServiceSpy.isAuthenticated.and.returnValue(true);
    authServiceSpy.termsAccepted.and.returnValue(false);

    const result = runGuard() as UrlTree;

    expect(result).toEqual(router.parseUrl('/termos-de-uso'));
  });

  it('redirects to / when there is no password change pending', () => {
    authServiceSpy.isAuthenticated.and.returnValue(true);
    authServiceSpy.termsAccepted.and.returnValue(true);
    authServiceSpy.mustChangePassword.and.returnValue(false);

    const result = runGuard() as UrlTree;

    expect(result).toEqual(router.parseUrl('/'));
  });

  it('allows access while a password change is pending', () => {
    authServiceSpy.isAuthenticated.and.returnValue(true);
    authServiceSpy.termsAccepted.and.returnValue(true);
    authServiceSpy.mustChangePassword.and.returnValue(true);

    expect(runGuard()).toBeTrue();
  });
});
