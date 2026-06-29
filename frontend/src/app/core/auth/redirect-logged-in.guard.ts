import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { homeRouteForRole } from './home-route.util';

export const redirectLoggedInGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) {
    const user = auth.user();
    if (user) {
      router.navigate([homeRouteForRole(user.rol)]);
      return false;
    }
  }

  return true;
};
