import { Routes } from '@angular/router';
import { DocenteMateriasComponent } from './pages/mis-materias/docente-materias.component';
import { DocenteInicioComponent } from './pages/docente-inicio/docente-inicio.component';
import { DocenteInscriptosComponent } from './pages/inscriptos/docente-inscriptos.component';
import { DocenteLayoutComponent } from './layout/docente-layout.component';

export const DOCENTE_ROUTES: Routes = [
  {
    path: '',
    component: DocenteLayoutComponent,
    children: [
      { path: 'inicio', component: DocenteInicioComponent },
      { path: 'mis-materias', component: DocenteMateriasComponent },
      { path: 'mis-materias/:materiaId/inscriptos', component: DocenteInscriptosComponent },

      { path: '', redirectTo: 'inicio', pathMatch: 'full' },
      { path: '**', redirectTo: 'inicio' },
    ],
  },
];
