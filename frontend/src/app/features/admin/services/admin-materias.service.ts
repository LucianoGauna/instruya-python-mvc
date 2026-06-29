import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Docente {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  label: string;
}

export interface MateriaDeCarrera {
  materia_id: number;
  materia_nombre: string;
  activa: number;
  docente_id: number;
  docente_nombre: string;
  docente_apellido: string;
  docente_email: string;
}

interface DocentesResponse {
  ok: boolean;
  docentes: Array<{
    id: number;
    nombre: string;
    apellido: string;
    email: string;
  }>;
}

interface MateriasResponse {
  ok: boolean;
  materias: MateriaDeCarrera[];
}

interface CreateMateriaResponse {
  ok: boolean;
  materia: {
    id: number;
    nombre: string;
    carrera_id: number;
    docente_id: number;
  };
}

@Injectable({ providedIn: 'root' })
export class AdminMateriasService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:3000/admin';

  getDocentes(): Observable<DocentesResponse> {
    return this.http.get<DocentesResponse>(`${this.baseUrl}/docentes`);
  }

  getMateriasByCarrera(carreraId: number): Observable<MateriasResponse> {
    return this.http.get<MateriasResponse>(
      `${this.baseUrl}/carreras/${carreraId}/materias`
    );
  }

  createMateria(
    carreraId: number,
    nombre: string,
    docenteId: number
  ): Observable<CreateMateriaResponse> {
    return this.http.post<CreateMateriaResponse>(
      `${this.baseUrl}/carreras/${carreraId}/materias`,
      { nombre, docente_id: docenteId }
    );
  }

  activarMateria(materiaId: number) {
    return this.http.patch<{ ok: boolean }>(
      `${this.baseUrl}/materias/${materiaId}/activar`,
      {}
    );
  }
  
  desactivarMateria(materiaId: number) {
    return this.http.patch<{ ok: boolean }>(
      `${this.baseUrl}/materias/${materiaId}/desactivar`,
      {}
    );
  }
  
  updateMateria(materiaId: number, nombre: string, docenteId: number) {
    return this.http.patch<{ ok: boolean }>(
      `${this.baseUrl}/materias/${materiaId}`,
      { nombre, docente_id: docenteId }
    );
  }  
}
