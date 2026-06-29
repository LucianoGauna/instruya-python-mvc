import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type Periodo = 'PRIMER_CUATRIMESTRE' | 'SEGUNDO_CUATRIMESTRE' | 'ANUAL';

export interface InscripcionPendiente {
  inscripcion_id: number;
  alumno_id: number;
  alumno_nombre: string;
  alumno_apellido: string;
  alumno_email: string;
  legajo: string | null;
  cohorte: number | null;
  materia_id: number;
  materia_nombre: string;
  carrera_id: number;
  carrera_nombre: string;
  fecha: string;
  created_at: string;
}

interface InscriptosPendientesResponse {
  ok: true;
  pendientes: InscripcionPendiente[];
}

@Injectable({ providedIn: 'root' })
export class AdminInscripcionesService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:3000/admin/inscripciones';

  getPendientes(): Observable<InscriptosPendientesResponse> {
    return this.http.get<InscriptosPendientesResponse>(
      `${this.baseUrl}/pendientes`
    );
  }

  aceptar(inscripcionId: number, anio: number, periodo: Periodo) {
    return this.http.patch<{ ok: boolean }>(
      `${this.baseUrl}/${inscripcionId}/aceptar`,
      { anio, periodo }
    );
  }

  rechazar(inscripcionId: number) {
    return this.http.patch<{ ok: boolean }>(
      `${this.baseUrl}/${inscripcionId}/rechazar`,
      {}
    );
  }
}
