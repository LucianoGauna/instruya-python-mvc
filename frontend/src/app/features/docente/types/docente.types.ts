export interface DocenteMateria {
  materia_id: number;
  materia_nombre: string;
  carrera_id: number;
  carrera_nombre: string;
}

export interface DocenteMisMateriasResponse {
  ok: boolean;
  materias: DocenteMateria[];
}

export interface Inscripto {
  alumno_id: number;
  nombre: string;
  apellido: string;
  email: string;
  estado: 'PENDIENTE' | 'ACEPTADA' | 'RECHAZADA' | 'BAJA';
  anio: number | null;
  periodo: 'PRIMER_CUATRIMESTRE' | 'SEGUNDO_CUATRIMESTRE' | 'ANUAL' | null;
  calificaciones: Calificacion[];
}

export interface DocenteInscriptosResponse {
  ok: boolean;
  inscriptos: Inscripto[];
}

export type TipoCalificacion =
  | 'TRABAJO_PRACTICO'
  | 'PARCIAL'
  | 'FINAL'
  | 'NOTA_MATERIA';

export interface Calificacion {
  calificacion_id: number;
  alumno_id: number;
  materia_id: number;
  tipo: TipoCalificacion;
  fecha: string;
  nota: string;
  descripcion: string | null;
  created_at: string;
}

export const TIPOS_CALIFICACION_OPTIONS: Array<{
  label: string;
  value: TipoCalificacion;
}> = [
  { label: 'Trabajo práctico', value: 'TRABAJO_PRACTICO' },
  { label: 'Parcial', value: 'PARCIAL' },
  { label: 'Final', value: 'FINAL' },
  { label: 'Nota materia', value: 'NOTA_MATERIA' },
];

export interface CreateCalificacionBody {
  alumno_id: number;
  tipo: TipoCalificacion;
  fecha: string;
  nota: string;
  descripcion?: string | null;
}

export interface CreateCalificacionResponse {
  ok: boolean;
  calificacion: Calificacion;
}

export interface UpdateCalificacionBody {
  tipo: TipoCalificacion;
  fecha: string;
  nota: string;
  descripcion?: string | null;
}

export interface UpdateCalificacionResponse {
  ok: boolean;
}

export interface DocenteDashboardResumen {
  institucion: {
    id: number;
    nombre: string;
  } | null;
  materias: {
    total: number;
    carreras: number;
  };
  alumnos: {
    unicos_inscriptos: number;
    inscripciones_aceptadas: number;
  };
}

export interface DocenteDashboardResumenResponse {
  ok: boolean;
  resumen: DocenteDashboardResumen;
}
