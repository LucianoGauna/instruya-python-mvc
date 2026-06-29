import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './pages/dashboard/admin-dashboard.component';
import { AdminCarrerasComponent } from './pages/admin-carreras/admin-carreras.component';
import { AdminCarreraMateriasComponent } from './pages/admin-carrera-materias/admin-carrera-materias.component';
import { AdminInscriptosPendientesComponent } from './pages/admin-inscripciones-pendientes/admin-inscripciones-pendientes.component';
import { AdminLayoutComponent } from './layout/admin-layout.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'carreras', component: AdminCarrerasComponent },
      {
        path: 'inscripciones-pendientes',
        component: AdminInscriptosPendientesComponent,
      },
      {
        path: 'carreras/:id/materias',
        component: AdminCarreraMateriasComponent,
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: '**', redirectTo: 'dashboard' },
    ],
  },
];
