import { Routes } from '@angular/router';
import { AlumnoInicioComponent } from './pages/inicio/alumno-inicio.component';
import { AlumnoMisMateriasComponent } from './pages/mis-materias/mis-materias.component';
import { MisCalificacionesComponent } from './pages/mis-calificaciones/mis-calificaciones.component';
import { AlumnoCatalogoMateriasComponent } from './pages/catalogo-materias/alumno-catalogo-materias.component';
import { AlumnoLayoutComponent } from './layout/alumno-layout.component';

export const ALUMNO_ROUTES: Routes = [
  {
    path: '',
    component: AlumnoLayoutComponent,
    children: [
      { path: 'inicio', component: AlumnoInicioComponent },
      { path: 'catalogo', component: AlumnoCatalogoMateriasComponent },
      { path: 'mis-materias', component: AlumnoMisMateriasComponent },
      { path: 'mis-calificaciones', component: MisCalificacionesComponent },
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },
      { path: '**', redirectTo: 'inicio' },
    ],
  },
];
