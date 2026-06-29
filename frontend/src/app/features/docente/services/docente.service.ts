import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CreateCalificacionBody,
  CreateCalificacionResponse,
  DocenteDashboardResumenResponse,
  DocenteInscriptosResponse,
  DocenteMisMateriasResponse,
  UpdateCalificacionBody,
  UpdateCalificacionResponse,
} from '../types/docente.types';

@Injectable({ providedIn: 'root' })
export class DocenteService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:3000/docente';

  getMisMaterias(): Observable<DocenteMisMateriasResponse> {
    return this.http.get<DocenteMisMateriasResponse>(
      `${this.baseUrl}/mis-materias`
    );
  }

  getDashboardResumen(): Observable<DocenteDashboardResumenResponse> {
    return this.http.get<DocenteDashboardResumenResponse>(
      `${this.baseUrl}/dashboard/resumen`
    );
  }

  getInscriptosByMateria(
    materiaId: number
  ): Observable<DocenteInscriptosResponse> {
    return this.http.get<DocenteInscriptosResponse>(
      `${this.baseUrl}/materias/${materiaId}/inscriptos`
    );
  }

  createCalificacion(
    materiaId: number,
    body: CreateCalificacionBody
  ): Observable<CreateCalificacionResponse> {
    return this.http.post<CreateCalificacionResponse>(
      `${this.baseUrl}/materias/${materiaId}/calificaciones`,
      body
    );
  }

  updateCalificacion(
    calificacionId: number,
    body: UpdateCalificacionBody
  ): Observable<UpdateCalificacionResponse> {
    return this.http.patch<UpdateCalificacionResponse>(
      `${this.baseUrl}/calificaciones/${calificacionId}`,
      body
    );
  }
}
