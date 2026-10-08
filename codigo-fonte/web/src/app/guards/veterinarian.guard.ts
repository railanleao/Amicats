import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/resources/auth.service';

export const veterinarianGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.currentUser()?.accessType === 'Veterinarian'
    ? true
    : router.createUrlTree(['/medical-records']);
};
