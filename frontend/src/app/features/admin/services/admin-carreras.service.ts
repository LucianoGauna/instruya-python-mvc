import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Carrera {
  id: number;
  nombre: string;
  activa: number;
  created_at: string;
}

interface CarrerasResponse {
  ok: boolean;
  carreras: Carrera[];
}

export interface CarreraDetalle {
  id: number;
  nombre: string;
  activa: number;
  created_at: string;
}

interface CarreraDetalleResponse {
  ok: boolean;
  carrera: CarreraDetalle;
}

interface CreateCarreraResponse {
  ok: boolean;
  carrera: { id: number; nombre: string; institucion_id: number };
}

@Injectable({ providedIn: 'root' })
export class AdminCarrerasService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/admin/carreras';

  getCarreras(): Observable<CarrerasResponse> {
    return this.http.get<CarrerasResponse>(this.apiUrl);
  }

  getCarreraById(id: number) {
    return this.http.get<CarreraDetalleResponse>(`${this.apiUrl}/${id}`);
  }

  createCarrera(nombre: string): Observable<CreateCarreraResponse> {
    return this.http.post<CreateCarreraResponse>(this.apiUrl, { nombre });
  }

  activarCarrera(id: number) {
    return this.http.patch<{ ok: boolean }>(`${this.apiUrl}/${id}/activar`, {});
  }

  desactivarCarrera(id: number) {
    return this.http.patch<{ ok: boolean }>(
      `${this.apiUrl}/${id}/desactivar`,
      {}
    );
  }

  updateCarrera(id: number, nombre: string) {
    return this.http.patch<{
      ok: boolean;
      carrera: { id: number; nombre: string };
    }>(`${this.apiUrl}/${id}`, { nombre });
  }
}
