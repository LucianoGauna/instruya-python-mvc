import { UserRole } from '../../shared/types/user.types';

export function homeRouteForRole(rol: UserRole | string): string {
  switch (rol) {
    case UserRole.SUPERADMIN:
    case 'SUPERADMIN':
      return '/superadmin/dashboard';

    case UserRole.ADMIN:
    case 'ADMIN':
      return '/admin/dashboard';

    case UserRole.DOCENTE:
    case 'DOCENTE':
      return '/docente/inicio';

    case UserRole.ALUMNO:
    case 'ALUMNO':
      return '/alumno/inicio';

    default:
      return '/';
  }
}
