import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import type {
  AlumnoDashboardResumen,
  CatalogoCarrera,
  CatalogoMateria,
  MiMateria,
} from '../types/alumno.types';

interface MisMateriasResponse {
  ok: boolean;
  materias: MiMateria[];
}

interface CatalogoMateriasResponse {
  ok: true;
  carrera: CatalogoCarrera;
  materias: CatalogoMateria[];
}

interface SolicitarInscripcionResponse {
  ok: boolean;
  inscripcion: {
    inscripcion_id: number;
    estado: 'PENDIENTE';
  };
}

interface DashboardResumenResponse {
  ok: boolean;
  resumen: AlumnoDashboardResumen;
}

@Injectable({ providedIn: 'root' })
export class AlumnoService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:3000/alumno';

  getMaterias(): Observable<MisMateriasResponse> {
    return this.http.get<MisMateriasResponse>(`${this.baseUrl}/mis-materias`);
  }

  getCatalogoMaterias(): Observable<CatalogoMateriasResponse> {
    return this.http.get<CatalogoMateriasResponse>(`${this.baseUrl}/materias`);
  }

  getDashboardResumen(): Observable<DashboardResumenResponse> {
    return this.http.get<DashboardResumenResponse>(
      `${this.baseUrl}/dashboard/resumen`,
    );
  }

  solicitarInscripcion(
    materiaId: number,
  ): Observable<SolicitarInscripcionResponse> {
    return this.http.post<SolicitarInscripcionResponse>(
      `${this.baseUrl}/materias/${materiaId}/inscribirse`,
      {},
    );
  }
}
