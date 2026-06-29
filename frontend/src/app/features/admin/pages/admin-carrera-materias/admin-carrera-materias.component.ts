import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import {
  AdminMateriasService,
  Docente,
  MateriaDeCarrera,
} from '../../services/admin-materias.service';
import { TooltipModule } from 'primeng/tooltip';
import { AdminCarrerasService } from '../../services/admin-carreras.service';

@Component({
  selector: 'app-admin-carrera-materias',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    ToastModule,
    TooltipModule,
  ],
  providers: [MessageService],
  templateUrl: './admin-carrera-materias.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCarreraMateriasComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private materiasService = inject(AdminMateriasService);
  private carrerasService = inject(AdminCarrerasService);
  private destroyRef = inject(DestroyRef);
  private messageService = inject(MessageService);

  carreraId = signal<number | null>(null);
  carreraNombre = signal<string | null>(null);

  loading = signal(true);
  error = signal<string | null>(null);

  materias = signal<MateriaDeCarrera[]>([]);
  docentes = signal<Docente[]>([]);

  nuevoNombre = signal('');
  docenteSeleccionadoId = signal<number | null>(null);
  creating = signal(false);
  updatingId = signal<number | null>(null);

  editingId = signal<number | null>(null);
  editNombre = signal('');
  editDocenteId = signal<number | null>(null);

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = Number(idParam);

    if (!Number.isFinite(id)) {
      this.error.set('ID de carrera inválido');
      this.loading.set(false);
      return;
    }

    this.carrerasService
      .getCarreraById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => this.carreraNombre.set(res.carrera.nombre),
        error: () => this.carreraNombre.set(null),
      });

    this.carreraId.set(id);
    this.loadAll();
  }

  goBack() {
    this.router.navigate(['/admin/carreras']);
  }

  isActiva(m: MateriaDeCarrera): boolean {
    return m.activa === 1;
  }

  createMateria() {
    const carreraId = this.carreraId();
    const nombre = this.nuevoNombre().trim();
    const docenteId = this.docenteSeleccionadoId();

    if (!carreraId) return;

    if (!nombre) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Falta nombre',
        detail: 'Escribí el nombre de la materia',
        life: 3000,
      });
      return;
    }

    if (!docenteId) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Falta docente',
        detail: 'Seleccioná un docente',
        life: 3000,
      });
      return;
    }

    this.creating.set(true);

    this.materiasService
      .createMateria(carreraId, nombre, docenteId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.nuevoNombre.set('');
          this.docenteSeleccionadoId.set(null);
          this.creating.set(false);

          this.messageService.add({
            severity: 'success',
            summary: 'Materia creada',
            detail: 'Se creó correctamente',
            life: 3000,
          });

          this.loadMaterias();
        },
        error: (err) => {
          this.creating.set(false);

          const msg =
            err?.status === 409
              ? 'Ya existe una materia con ese nombre en la carrera'
              : err?.status === 404
              ? 'Carrera o docente no encontrado'
              : err?.status === 400
              ? 'Datos inválidos'
              : 'No se pudo crear la materia';

          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: msg,
            life: 3500,
          });
        },
      });
  }

  desactivar(m: MateriaDeCarrera) {
    this.updatingId.set(m.materia_id);

    this.materiasService
      .desactivarMateria(m.materia_id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Materia desactivada',
            detail: `"${m.materia_nombre}" quedó inactiva`,
            life: 3000,
          });
          this.updatingId.set(null);
          this.loadMaterias();
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo desactivar la materia',
            life: 3500,
          });
          this.updatingId.set(null);
        },
      });
  }

  activar(m: MateriaDeCarrera) {
    this.updatingId.set(m.materia_id);

    this.materiasService
      .activarMateria(m.materia_id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Materia activada',
            detail: `"${m.materia_nombre}" volvió a estar activa`,
            life: 3000,
          });
          this.updatingId.set(null);
          this.loadMaterias();
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo activar la materia',
            life: 3500,
          });
          this.updatingId.set(null);
        },
      });
  }

  startEdit(m: MateriaDeCarrera) {
    this.editingId.set(m.materia_id);
    this.editNombre.set(m.materia_nombre);
    this.editDocenteId.set(m.docente_id);
  }

  cancelEdit() {
    this.editingId.set(null);
    this.editNombre.set('');
    this.editDocenteId.set(null);
  }

  saveEdit(m: MateriaDeCarrera) {
    const nombre = this.editNombre().trim();
    const docenteId = this.editDocenteId();

    if (!nombre) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Falta nombre',
        detail: 'El nombre es requerido',
        life: 3000,
      });
      return;
    }

    if (!docenteId) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Falta docente',
        detail: 'Seleccioná un docente',
        life: 3000,
      });
      return;
    }

    this.updatingId.set(m.materia_id);

    this.materiasService
      .updateMateria(m.materia_id, nombre, docenteId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Materia actualizada',
            detail: 'Se guardaron los cambios',
            life: 3000,
          });

          this.updatingId.set(null);
          this.cancelEdit();
          this.loadMaterias();
        },
        error: (err) => {
          this.updatingId.set(null);

          const msg =
            err?.status === 409
              ? 'Ya existe una materia con ese nombre en la carrera'
              : err?.status === 404
              ? 'Materia o docente no encontrado'
              : err?.status === 400
              ? 'Datos inválidos'
              : 'No se pudo actualizar la materia';

          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: msg,
            life: 3500,
          });
        },
      });
  }

  private loadAll() {
    this.loading.set(true);
    this.error.set(null);

    // Obtengo docentes
    this.materiasService
      .getDocentes()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const opciones: Docente[] = res.docentes.map((d) => ({
            ...d,
            label: `${d.apellido}, ${d.nombre} (${d.email})`,
          }));
          this.docentes.set(opciones);

          // Obtengo materias
          this.loadMaterias();
        },
        error: () => {
          this.error.set('No se pudieron cargar los docentes');
          this.loading.set(false);
        },
      });
  }

  private loadMaterias() {
    const carreraId = this.carreraId();
    if (!carreraId) return;

    this.materiasService
      .getMateriasByCarrera(carreraId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.materias.set(res.materias);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('No se pudieron cargar las materias');
          this.loading.set(false);
        },
      });
  }
}
