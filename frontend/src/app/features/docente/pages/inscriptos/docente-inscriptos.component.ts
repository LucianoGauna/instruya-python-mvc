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
import { ButtonModule } from 'primeng/button';
import { DocenteService } from '../../services/docente.service';
import {
  Calificacion,
  Inscripto,
  TipoCalificacion,
  TIPOS_CALIFICACION_OPTIONS,
} from '../../types/docente.types';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';

@Component({
  standalone: true,
  selector: 'app-docente-inscriptos',
  imports: [
    CommonModule,
    ButtonModule,
    DatePickerModule,
    DialogModule,
    DropdownModule,
    InputNumberModule,
    InputTextModule,
    ReactiveFormsModule,
    TextareaModule,
    ToastModule,
  ],
  templateUrl: './docente-inscriptos.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MessageService],
})
export class DocenteInscriptosComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(DocenteService);
  private destroyRef = inject(DestroyRef);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);

  tiposCalificacion = TIPOS_CALIFICACION_OPTIONS;
  tiposCalificacionDisponibles = signal(TIPOS_CALIFICACION_OPTIONS);

  materiaId = signal<number | null>(null);

  loading = signal(true);
  error = signal<string | null>(null);
  inscriptos = signal<Inscripto[]>([]);

  dialogVisible = signal(false);
  selectedAlumno = signal<Inscripto | null>(null);
  saving = signal(false);

  calificacionForm = this.fb.group({
    tipo: ['PARCIAL' as TipoCalificacion, Validators.required],
    nota: [null as number | null, Validators.required],
    fecha: [new Date(), Validators.required],
    descripcion: [''],
  });

  editingCalificacion = signal<Calificacion | null>(null);

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('materiaId');
    const id = Number(idParam);

    if (!Number.isFinite(id)) {
      this.error.set('Materia inválida');
      this.loading.set(false);
      return;
    }

    this.materiaId.set(id);
    this.load();
  }

  goBack() {
    this.router.navigate(['/docente/mis-materias']);
  }

  isEditing(): boolean {
    return this.editingCalificacion() !== null;
  }

  openCreateDialog(alumno: Inscripto) {
    this.selectedAlumno.set(alumno);
    const yaTieneFinal = alumno.calificaciones?.some((c) => c.tipo === 'FINAL');
    const yaTieneNotaMateria = alumno.calificaciones?.some(
      (c) => c.tipo === 'NOTA_MATERIA',
    );

    this.tiposCalificacionDisponibles.set(
      TIPOS_CALIFICACION_OPTIONS.filter((t) => {
        if (t.value === 'FINAL' && yaTieneFinal) return false;
        if (t.value === 'NOTA_MATERIA' && yaTieneNotaMateria) return false;
        return true;
      }),
    );

    const tipoDefault = 'PARCIAL';
    this.calificacionForm.reset({
      tipo: tipoDefault,
      nota: null,
      fecha: new Date(),
      descripcion: '',
    });
    this.dialogVisible.set(true);
  }

  openEditDialog(alumno: Inscripto, cal: Calificacion) {
    this.selectedAlumno.set(alumno);
    this.editingCalificacion.set(cal);
    this.tiposCalificacionDisponibles.set(TIPOS_CALIFICACION_OPTIONS);

    this.calificacionForm.reset({
      tipo: cal.tipo,
      nota: Number(cal.nota),
      fecha: new Date(cal.fecha),
      descripcion: cal.descripcion ?? '',
    });

    this.dialogVisible.set(true);
  }

  closeDialog() {
    this.calificacionForm.reset({
      tipo: 'PARCIAL',
      nota: null,
      fecha: new Date(),
      descripcion: '',
    });
    this.dialogVisible.set(false);
    this.selectedAlumno.set(null);
    this.editingCalificacion.set(null);
    this.tiposCalificacionDisponibles.set(TIPOS_CALIFICACION_OPTIONS);
  }

  saveCalificacion() {
    const materiaId = this.materiaId();
    const alumno = this.selectedAlumno();
    const editing = this.editingCalificacion();

    if (!materiaId || !alumno) return;

    if (this.calificacionForm.invalid) {
      this.calificacionForm.markAllAsTouched();
      return;
    }

    const raw = this.calificacionForm.getRawValue();
    const { tipo, nota, fecha, descripcion } = raw;

    if (!tipo || nota === null || !fecha) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Faltan datos',
        detail: 'Completá tipo, nota y fecha',
        life: 3000,
      });
      return;
    }

    const fechaISO = this.toDateOnlyISO(fecha as Date);

    const body = {
      tipo,
      nota: String(nota),
      fecha: fechaISO,
      descripcion: descripcion?.trim() ? descripcion.trim() : null,
    };

    this.saving.set(true);

    const request$ = editing
      ? this.service.updateCalificacion(editing.calificacion_id, body)
      : this.service.createCalificacion(materiaId, {
          alumno_id: alumno.alumno_id,
          ...body,
        });

    request$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.saving.set(false);

        this.messageService.add({
          severity: 'success',
          summary: editing ? 'Calificación actualizada' : 'Calificación creada',
          detail: editing
            ? `Se actualizó la calificación de ${alumno.apellido}, ${alumno.nombre}`
            : `Se agregó a ${alumno.apellido}, ${alumno.nombre}`,
          life: 3000,
        });

        this.closeDialog();
        this.load();
      },
      error: (err) => {
        this.saving.set(false);

        const msg =
          err?.status === 400
            ? 'Datos inválidos (revisá tipo/nota/fecha)'
            : err?.status === 409
              ? err?.error?.message ??
                'Ya existe un FINAL/NOTA_MATERIA para este alumno en esta materia'
              : err?.status === 404
                ? 'No encontrado'
                : 'No se pudo guardar la calificación';

        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: msg,
          life: 3500,
        });
      },
    });
  }

  private load() {
    const id = this.materiaId();
    if (!id) return;

    this.loading.set(true);
    this.error.set(null);

    this.service
      .getInscriptosByMateria(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.inscriptos.set(res.inscriptos);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('No se pudieron cargar los inscriptos');
          this.loading.set(false);
        },
      });
  }

  private toDateOnlyISO(d: Date): string {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
}
