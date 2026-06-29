import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { SelectButtonModule } from 'primeng/selectbutton';
import { AlumnoService } from '../../services/alumno.service';
import { CatalogoCarrera, CatalogoMateria, EstadoFiltro } from '../../types/alumno.types';
import { Tooltip } from "primeng/tooltip";

@Component({
  selector: 'app-alumno-catalogo-materias',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    SelectButtonModule,
    ToastModule,
    Tooltip
],
  providers: [MessageService],
  templateUrl: './alumno-catalogo-materias.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlumnoCatalogoMateriasComponent {
  private alumnoService = inject(AlumnoService);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);
  private messageService = inject(MessageService);

  loading = signal(true);
  error = signal<string | null>(null);
  carrera = signal<CatalogoCarrera | null>(null);
  materias = signal<CatalogoMateria[]>([]);

  requestingMateriaId = signal<number | null>(null);

  stateOptions: Array<{ label: string; value: EstadoFiltro }> = [
    { label: 'Todas', value: 'TODAS' },
    { label: 'Sin inscripción', value: 'SIN_INSCRIPCION' },
    { label: 'Pendientes', value: 'PENDIENTE' },
    { label: 'Aceptadas', value: 'ACEPTADA' },
    { label: 'Rechazadas', value: 'RECHAZADA' },
  ];
  selectedFilter: EstadoFiltro = 'TODAS';

  ngOnInit() {
    this.loadCatalogo();
  }

  goBack() {
    this.router.navigate(['/alumno/inicio']);
  }

  puedeSolicitar(materia: CatalogoMateria): boolean {
    if (!materia.inscripcion) return true;
    return (
      materia.inscripcion.estado === 'RECHAZADA' ||
      materia.inscripcion.estado === 'BAJA'
    );
  }

  estadoLabel(materia: CatalogoMateria): string {
    const estado = this.estadoKey(materia);
    switch (estado) {
      case 'PENDIENTE':
        return 'Pendiente';
      case 'ACEPTADA':
        return 'Aceptada';
      case 'RECHAZADA':
        return 'Rechazada';
      case 'BAJA':
        return 'Baja';
      default:
        return 'Sin inscripción';
    }
  }

  solicitarInscripcion(materia: CatalogoMateria) {
    if (!this.puedeSolicitar(materia)) return;

    this.requestingMateriaId.set(materia.materia_id);

    this.alumnoService
      .solicitarInscripcion(materia.materia_id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.requestingMateriaId.set(null);

          this.materias.update((current) =>
            current.map((m) =>
              m.materia_id === materia.materia_id
                ? {
                    ...m,
                    inscripcion: {
                      inscripcion_id: res.inscripcion.inscripcion_id,
                      estado: 'PENDIENTE',
                      fecha: new Date().toISOString().slice(0, 10),
                      anio: null,
                      periodo: null,
                    },
                  }
                : m
            )
          );

          this.messageService.add({
            severity: 'success',
            summary: 'Solicitud enviada',
            detail: `Tu inscripción en "${materia.materia_nombre}" quedó pendiente`,
            life: 3000,
          });
        },
        error: (err) => {
          this.requestingMateriaId.set(null);

          const detail =
            err?.status === 409
              ? 'Ya tenés una inscripción pendiente o aceptada en esta materia'
              : err?.status === 404
              ? 'No se encontró la materia o tu perfil de alumno'
              : 'No se pudo solicitar la inscripción';

          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail,
            life: 3500,
          });
        },
      });
  }

  private loadCatalogo() {
    this.loading.set(true);
    this.error.set(null);

    this.alumnoService
      .getCatalogoMaterias()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.carrera.set(res.carrera);
          this.materias.set(res.materias);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('No se pudo cargar el catálogo de materias');
          this.loading.set(false);
        },
      });
  }

  materiasFiltradas(): CatalogoMateria[] {
    const all = this.materias();
    if (this.selectedFilter === 'TODAS') return all;
    return all.filter((m) => this.estadoKey(m) === this.selectedFilter);
  }

  private estadoKey(materia: CatalogoMateria): EstadoFiltro {
    return materia.inscripcion?.estado ?? 'SIN_INSCRIPCION';
  }
}
