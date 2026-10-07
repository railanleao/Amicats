import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  UrlTree,
  provideRouter,
} from '@angular/router';

import { AuthService } from '../services/resources/auth.service';
import { veterinarianGuard } from './veterinarian.guard';

describe('veterinarianGuard', () => {
  function runGuard(accessType: string | null) {
    const user = accessType ? { id: 1, name: 'Usuária', accessType } : null;

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: { currentUser: signal(user) } as unknown as AuthService,
        },
      ],
    });

    return TestBed.runInInjectionContext(() =>
      veterinarianGuard(
        {} as ActivatedRouteSnapshot,
        {} as RouterStateSnapshot,
      ),
    );
  }

  it('lets a veterinarian through', () => {
    expect(runGuard('Veterinarian')).toBeTrue();
  });

  it('sends any other profile back to the medical records list', () => {
    const result = runGuard('Administrator');

    expect(result instanceof UrlTree).toBeTrue();
    expect(TestBed.inject(Router).serializeUrl(result as UrlTree)).toBe(
      '/medical-records',
    );
  });
});
