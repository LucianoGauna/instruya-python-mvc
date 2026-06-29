import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ButtonModule } from 'primeng/button';
import {
  AdminCarrerasService,
  Carrera,
} from '../../services/admin-carreras.service';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { SelectButtonModule } from 'primeng/selectbutton';

type CarrerasFiltro = 'TODAS' | 'ACTIVAS' | 'INACTIVAS';

@Component({
  selector: 'app-admin-carreras',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    FormsModule,
    InputTextModule,
    SelectButtonModule,
    ToastModule,
    TooltipModule,
  ],
  providers: [MessageService],
  templateUrl: './admin-carreras.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCarrerasComponent {
  private service = inject(AdminCarrerasService);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);
  private messageService = inject(MessageService);

  loading = signal(true);
  error = signal<string | null>(null);
  carreras = signal<Carrera[]>([]);

  nuevoNombre = signal('');
  creating = signal(false);
  updatingId = signal<number | null>(null);
  editingId = signal<number | null>(null);
  editNombre = signal('');

  filterOptions: Array<{ label: string; value: CarrerasFiltro }> = [
    { label: 'Todas', value: 'TODAS' },
    { label: 'Activas', value: 'ACTIVAS' },
    { label: 'Inactivas', value: 'INACTIVAS' },
  ];
  selectedFilter: CarrerasFiltro = 'TODAS';

  ngOnInit() {
    this.loadCarreras();
  }

  goBack() {
    this.router.navigate(['/admin/dashboard']);
  }

  isActiva(c: Carrera): boolean {
    return c.activa === 1;
  }

  create() {
    const nombre = this.nuevoNombre().trim();

    if (!nombre) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Falta nombre',
        detail: 'Escribí un nombre de carrera',
        life: 3000,
      });
      return;
    }

    this.creating.set(true);

    this.service
      .createCarrera(nombre)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.nuevoNombre.set('');
          this.creating.set(false);

          this.messageService.add({
            severity: 'success',
            summary: 'Carrera creada',
            detail: 'Se creó correctamente',
            life: 3000,
          });

          this.loadCarreras();
        },
        error: (err) => {
          this.creating.set(false);

          if (err?.status === 409) {
            this.messageService.add({
              severity: 'warn',
              summary: 'Duplicado',
              detail: 'Ya existe una carrera con ese nombre',
              life: 3500,
            });
            return;
          }

          if (err?.status === 400) {
            this.messageService.add({
              severity: 'warn',
              summary: 'Datos inválidos',
              detail: 'El nombre es requerido',
              life: 3500,
            });
            return;
          }

          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo crear la carrera',
            life: 3500,
          });
        },
      });
  }

  desactivar(c: Carrera) {
    this.updatingId.set(c.id);

    this.service
      .desactivarCarrera(c.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Carrera desactivada',
            detail: `"${c.nombre}" quedó inactiva`,
            life: 3000,
          });
          this.loadCarreras();
          this.updatingId.set(null);
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo desactivar la carrera',
            life: 3500,
          });
          this.updatingId.set(null);
        },
      });
  }

  activar(c: Carrera) {
    this.updatingId.set(c.id);

    this.service
      .activarCarrera(c.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Carrera activada',
            detail: `"${c.nombre}" volvió a estar activa`,
            life: 3000,
          });
          this.loadCarreras();
          this.updatingId.set(null);
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo activar la carrera',
            life: 3500,
          });
          this.updatingId.set(null);
        },
      });
  }

  startEdit(c: Carrera) {
    this.editingId.set(c.id);
    this.editNombre.set(c.nombre);
  }

  cancelEdit() {
    this.editingId.set(null);
    this.editNombre.set('');
  }

  saveEdit(c: Carrera) {
    const nombre = this.editNombre().trim();

    if (!nombre) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Falta nombre',
        detail: 'El nombre es requerido',
        life: 3000,
      });
      return;
    }

    this.updatingId.set(c.id);

    this.service
      .updateCarrera(c.id, nombre)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Carrera actualizada',
            detail: 'Se guardó el nuevo nombre',
            life: 3000,
          });

          this.cancelEdit();
          this.updatingId.set(null);
          this.loadCarreras();
        },
        error: (err) => {
          this.updatingId.set(null);

          if (err?.status === 409) {
            this.messageService.add({
              severity: 'warn',
              summary: 'Duplicado',
              detail: 'Ya existe una carrera con ese nombre',
              life: 3500,
            });
            return;
          }

          if (err?.status === 400) {
            this.messageService.add({
              severity: 'warn',
              summary: 'Datos inválidos',
              detail: 'El nombre es requerido',
              life: 3500,
            });
            return;
          }

          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo actualizar la carrera',
            life: 3500,
          });
        },
      });
  }

  verMaterias(c: Carrera) {
    this.router.navigate(['/admin/carreras', c.id, 'materias']);
  }

  carrerasFiltradas(): Carrera[] {
    const all = this.carreras();
    if (this.selectedFilter === 'TODAS') return all;
    if (this.selectedFilter === 'ACTIVAS') {
      return all.filter((c) => this.isActiva(c));
    }
    return all.filter((c) => !this.isActiva(c));
  }

  private loadCarreras() {
    this.loading.set(true);
    this.error.set(null);

    this.service
      .getCarreras()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.carreras.set(res.carreras);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('No se pudieron cargar las carreras');
          this.loading.set(false);
        },
      });
  }
}
