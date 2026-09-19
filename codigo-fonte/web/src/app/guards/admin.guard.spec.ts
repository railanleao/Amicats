import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  UrlTree,
  provideRouter,
} from '@angular/router';

import { AccessType } from '../models/auth.model';
import { AuthService } from '../services/resources/auth.service';
import { adminGuard } from './admin.guard';

describe('adminGuard', () => {
  const currentUser = signal<{ id: number; name: string; accessType: AccessType } | null>(null);

  beforeEach(() => {
    currentUser.set(null);
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useValue: { currentUser } }],
    });
  });

  function runGuard() {
    return TestBed.runInInjectionContext(() =>
      adminGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );
  }

  function redirectTarget(result: unknown): string {
    return TestBed.inject(Router).serializeUrl(result as UrlTree);
  }

  it('allows an administrator', () => {
    currentUser.set({ id: 1, name: 'Ana', accessType: 'Administrator' });

    expect(runGuard()).toBeTrue();
  });

  it('redirects a non-administrator to the home page', () => {
    currentUser.set({ id: 2, name: 'Rui', accessType: 'Viewer' });

    expect(redirectTarget(runGuard())).toBe('/');
  });

  it('redirects to the home page when nobody is logged in', () => {
    expect(redirectTarget(runGuard())).toBe('/');
  });
});
