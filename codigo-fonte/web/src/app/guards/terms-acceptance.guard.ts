import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/resources/auth.service';

export const termsAcceptanceGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return router.parseUrl('/login');
  }

  if (!authService.termsAccepted()) {
    return true;
  }

  return router.parseUrl(
    authService.mustChangePassword() ? '/definir-nova-senha' : '/',
  );
};
