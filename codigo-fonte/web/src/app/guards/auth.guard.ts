import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/resources/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return router.parseUrl('/login');
  }

  if (!authService.termsAccepted()) {
    return router.parseUrl('/termos-de-uso');
  }

  if (authService.mustChangePassword()) {
    return router.parseUrl('/definir-nova-senha');
  }

  return true;
};
