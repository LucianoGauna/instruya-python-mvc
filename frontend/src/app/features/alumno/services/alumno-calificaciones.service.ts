import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type TipoCalificacion = 'TRABAJO_PRACTICO' | 'PARCIAL' | 'FINAL' | 'NOTA_MATERIA';

export interface MiCalificacion {
  calificacion_id: number;
  tipo: TipoCalificacion;
  fecha: string; 
  nota: string;  
  materia_id: number;
  materia_nombre: string;
  docente_id: number;
  docente_nombre: string;
  docente_apellido: string;
  docente_email: string;
}

interface MisCalificacionesResponse {
  ok: boolean;
  calificaciones: MiCalificacion[];
}

@Injectable({ providedIn: 'root' })
export class AlumnoCalificacionesService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/alumno/mis-calificaciones';

  getMisCalificaciones(): Observable<MisCalificacionesResponse> {
    return this.http.get<MisCalificacionesResponse>(this.apiUrl);
  }
}
