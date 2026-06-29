import { Routes } from '@angular/router';
import { SuperadminDashboardComponent } from './pages/dashboard/superadmin-dashboard.component';
import { SuperadminInstitucionesComponent } from './pages/instituciones/superadmin-instituciones.component';
import { SuperadminLayoutComponent } from './layout/superadmin-layout/superadmin-layout.component';

export const SUPERADMIN_ROUTES: Routes = [
  {
    path: '',
    component: SuperadminLayoutComponent,
    children: [
      { path: 'dashboard', component: SuperadminDashboardComponent },
      { path: 'instituciones', component: SuperadminInstitucionesComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: '**', redirectTo: 'dashboard' },
    ],
  },
];
