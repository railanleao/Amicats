import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AccessType } from '../models/auth.model';
import { AuthService } from '../services/resources/auth.service';

export const roleGuard = (
  allowedAccessTypes: readonly AccessType[],
): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const accessType = authService.currentUser()?.accessType;

    if (accessType && allowedAccessTypes.includes(accessType)) {
      return true;
    }

    return router.parseUrl('/');
  };
};
