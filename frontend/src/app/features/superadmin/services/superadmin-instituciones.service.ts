import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Institucion {
  id: number;
  nombre: string;
  email: string;
  direccion: string | null;
  activa: 0 | 1;
  created_at: string;
}

interface InstitucionesResponse {
  ok: boolean;
  instituciones: Institucion[];
}

interface CrearInstitucionResponse {
  ok: boolean;
  institucion: {
    id: number;
    nombre: string;
    email: string;
    direccion: string | null;
    activa: 0 | 1;
  };
  admin: {
    id: number;
    email: string;
  };
}

export interface CreateAdminEnInstitucionPayload {
  nombre: string;
  apellido: string;
  email: string;
  contrasenia: string;
}

export interface CreateAdminEnInstitucionResponse {
  ok: boolean;
  admin: {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    rol: 'ADMIN';
    institucion_id: number;
    activo: 1;
  };
}

export interface AdminDeInstitucion {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  activo: 0 | 1;
  created_at: string;
}

export interface GetAdminsByInstitucionResponse {
  ok: boolean;
  admins: AdminDeInstitucion[];
}

@Injectable({ providedIn: 'root' })
export class SuperadminInstitucionesService {
  private http = inject(HttpClient);
  private superadminBaseUrl = 'http://localhost:3000/superadmin';
  private apiUrl = 'http://localhost:3000/superadmin/instituciones';

  getInstituciones(): Observable<InstitucionesResponse> {
    return this.http.get<InstitucionesResponse>(this.apiUrl);
  }

  createInstitucion(payload: {
    institucion: { nombre: string; email: string; direccion: string };
    admin: {
      nombre: string;
      apellido: string;
      email: string;
      contrasenia: string;
    };
  }): Observable<CrearInstitucionResponse> {
    return this.http.post<CrearInstitucionResponse>(this.apiUrl, payload);
  }

  updateInstitucion(
    id: number,
    payload: { nombre: string; email: string; direccion: string },
  ) {
    return this.http.patch<{ ok: boolean; institucion: Institucion }>(
      `${this.apiUrl}/${id}`,
      payload,
    );
  }

  activarInstitucion(id: number) {
    return this.http.patch<{ ok: boolean }>(`${this.apiUrl}/${id}/activar`, {});
  }

  desactivarInstitucion(id: number) {
    return this.http.patch<{ ok: boolean }>(
      `${this.apiUrl}/${id}/desactivar`,
      {},
    );
  }

  createAdminEnInstitucion(
    id: number,
    payload: CreateAdminEnInstitucionPayload,
  ) {
    return this.http.post<CreateAdminEnInstitucionResponse>(
      `${this.apiUrl}/${id}/admins`,
      payload,
    );
  }

  getAdminsByInstitucion(id: number) {
    return this.http.get<GetAdminsByInstitucionResponse>(
      `${this.apiUrl}/${id}/admins`,
    );
  }

  activarAdmin(adminId: number) {
    return this.http.patch<{ ok: boolean }>(
      `${this.superadminBaseUrl}/admins/${adminId}/activar`,
      {},
    );
  }

  desactivarAdmin(adminId: number) {
    return this.http.patch<{ ok: boolean }>(
      `${this.superadminBaseUrl}/admins/${adminId}/desactivar`,
      {},
    );
  }
}
