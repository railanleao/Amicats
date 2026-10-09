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
import { administratorOrVeterinarianGuard } from './administrator-or-veterinarian.guard';

describe('administratorOrVeterinarianGuard', () => {
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

  function runGuard() {
    return TestBed.runInInjectionContext(() =>
      administratorOrVeterinarianGuard(
        {} as ActivatedRouteSnapshot,
        {} as RouterStateSnapshot,
      ),
    );
  }

  function redirectTarget(result: unknown): string {
    return TestBed.inject(Router).serializeUrl(result as UrlTree);
  }

  it('allows an administrator', () => {
    currentUser.set({ id: 1, name: 'Ana', accessType: 'Administrator' });

    expect(runGuard()).toBeTrue();
  });

  it('allows a veterinarian', () => {
    currentUser.set({ id: 2, name: 'Pedro', accessType: 'Veterinarian' });

    expect(runGuard()).toBeTrue();
  });

  it('redirects an assistant or viewer to the home page', () => {
    currentUser.set({ id: 3, name: 'Rui', accessType: 'Assistant' });

    expect(redirectTarget(runGuard())).toBe('/');
  });

  it('redirects to the home page when nobody is logged in', () => {
    expect(redirectTarget(runGuard())).toBe('/');
  });
});
