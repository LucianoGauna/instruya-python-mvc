import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { homeRouteForRole } from './home-route.util';

export function roleGuard(allowedRoles: string[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (!auth.isLoggedIn()) {
      router.navigate(['/']);
      return false;
    }

    const user = auth.user();

    if (!user) {
      router.navigate(['/']);
      return false;
    }

    if (!allowedRoles.includes(user.rol)) {
      router.navigate([homeRouteForRole(user.rol)]);
      return false;
    }

    return true;
  };
}
