import { Routes } from '@angular/router';
import { LoginPageComponent } from './pages/login.component';
import { redirectLoggedInGuard } from '../../core/auth/redirect-logged-in.guard';

export const LOGIN_ROUTES: Routes = [
  {
    path: '',
    component: LoginPageComponent,
    canActivate: [redirectLoggedInGuard],
  },
];
