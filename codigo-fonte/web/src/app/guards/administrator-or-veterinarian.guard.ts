import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/resources/auth.service';

// Matches the backend's role check for room transfers (RF-005 / UC-06-style: same restriction as
// editing a cat's registration) — Administrator and Médico-Veterinário only.
export const administratorOrVeterinarianGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const accessType = authService.currentUser()?.accessType;
  if (accessType === 'Administrator' || accessType === 'Veterinarian') {
    return true;
  }

  return router.parseUrl('/');
};
