import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AdminDashboardResumen {
  institucion: {
    id: number;
    nombre: string;
  };
  carreras: {
    total: number;
    activas: number;
  };
  materias: {
    total: number;
    activas: number;
  };
  inscripciones: {
    pendientes: number;
  };
}

interface DashboardResumenResponse {
  ok: boolean;
  resumen: AdminDashboardResumen;
}

@Injectable({ providedIn: 'root' })
export class AdminDashboardService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/admin/dashboard/resumen';

  getResumen(): Observable<DashboardResumenResponse> {
    return this.http.get<DashboardResumenResponse>(this.apiUrl);
  }
}
