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
import { roleGuard } from './role.guard';

describe('roleGuard', () => {
  const currentUser = signal<{
    id: number;
    name: string;
    accessType: AccessType;
  } | null>(null);

  beforeEach(() => {
    currentUser.set(null);

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { currentUser } },
      ],
    });
  });

  function runGuard(allowedAccessTypes: readonly AccessType[]) {
    const guard = roleGuard(allowedAccessTypes);

    return TestBed.runInInjectionContext(() =>
      guard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );
  }

  function redirectTarget(result: unknown): string {
    return TestBed.inject(Router).serializeUrl(result as UrlTree);
  }

  it('allows an administrator when the role is allowed', () => {
    currentUser.set({
      id: 1,
      name: 'Ana',
      accessType: 'Administrator',
    });

    expect(runGuard(['Administrator', 'Assistant'])).toBeTrue();
  });

  it('allows an assistant when the role is allowed', () => {
    currentUser.set({
      id: 2,
      name: 'Rui',
      accessType: 'Assistant',
    });

    expect(runGuard(['Administrator', 'Assistant'])).toBeTrue();
  });

  it('allows a veterinarian when the role is allowed', () => {
    currentUser.set({
      id: 3,
      name: 'Marina',
      accessType: 'Veterinarian',
    });

    expect(
      runGuard(['Administrator', 'Assistant', 'Veterinarian']),
    ).toBeTrue();
  });

  it('redirects a veterinarian when the role is not allowed', () => {
    currentUser.set({
      id: 4,
      name: 'Carlos',
      accessType: 'Veterinarian',
    });

    expect(
      redirectTarget(runGuard(['Administrator', 'Assistant'])),
    ).toBe('/');
  });

  it('redirects a viewer to the home page', () => {
    currentUser.set({
      id: 5,
      name: 'Paula',
      accessType: 'Viewer',
    });

    expect(
      redirectTarget(
        runGuard(['Administrator', 'Assistant', 'Veterinarian']),
      ),
    ).toBe('/');
  });

  it('redirects to the home page when nobody is logged in', () => {
    expect(
      redirectTarget(
        runGuard(['Administrator', 'Assistant', 'Veterinarian']),
      ),
    ).toBe('/');
  });
});
