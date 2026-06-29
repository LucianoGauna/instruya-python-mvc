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
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { DatePickerModule } from 'primeng/datepicker';
import { DropdownModule } from 'primeng/dropdown';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  AdminInscripcionesService,
  InscripcionPendiente,
  Periodo,
} from '../../services/admin-inscripciones.service';

const PERIODOS_OPTIONS: Array<{ label: string; value: Periodo }> = [
  { label: 'Primer cuatrimestre', value: 'PRIMER_CUATRIMESTRE' },
  { label: 'Segundo cuatrimestre', value: 'SEGUNDO_CUATRIMESTRE' },
  { label: 'Anual', value: 'ANUAL' },
];

@Component({
  selector: 'app-admin-inscripciones-pendientes',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    DatePickerModule,
    DialogModule,
    DropdownModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './admin-inscripciones-pendientes.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminInscriptosPendientesComponent {
  private service = inject(AdminInscripcionesService);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);

  loading = signal(true);
  error = signal<string | null>(null);
  pendientes = signal<InscripcionPendiente[]>([]);

  dialogVisible = signal(false);
  selected = signal<InscripcionPendiente | null>(null);

  savingAccept = signal(false);
  processingRejectId = signal<number | null>(null);

  periodosOptions = PERIODOS_OPTIONS;

  acceptForm = this.fb.group({
    anio: [null as Date | null, Validators.required],
    periodo: [null as Periodo | null, Validators.required],
  });

  ngOnInit() {
    this.loadPendientes();
  }

  goBack() {
    this.router.navigate(['/admin/dashboard']);
  }

  openAceptarDialog(item: InscripcionPendiente) {
    this.selected.set(item);
    this.acceptForm.reset({
      anio: new Date(),
      periodo: null,
    });
    this.dialogVisible.set(true);
  }

  closeDialog() {
    this.dialogVisible.set(false);
    this.selected.set(null);
    this.acceptForm.reset({
      anio: null,
      periodo: null,
    });
  }

  aceptarSeleccionada() {
    const selected = this.selected();
    if (!selected) return;

    if (this.acceptForm.invalid) {
      this.acceptForm.markAllAsTouched();
      return;
    }

    const anioDate = this.acceptForm.controls.anio.value;
    const periodo = this.acceptForm.controls.periodo.value;
    if (!anioDate || !periodo) return;

    const anio = anioDate.getFullYear();

    this.savingAccept.set(true);

    this.service
      .aceptar(selected.inscripcion_id, anio, periodo)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.savingAccept.set(false);
          this.removeFromList(selected.inscripcion_id);
          this.closeDialog();
          this.messageService.add({
            severity: 'success',
            summary: 'Inscripción aceptada',
            detail: `${selected.alumno_apellido}, ${selected.alumno_nombre} fue aceptado`,
            life: 3000,
          });
        },
        error: () => {
          this.savingAccept.set(false);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo aceptar la inscripción',
            life: 3500,
          });
        },
      });
  }

  rechazar(item: InscripcionPendiente) {
    const confirm = window.confirm(
      `¿Rechazar la inscripción de ${item.alumno_apellido}, ${item.alumno_nombre}?`
    );
    if (!confirm) return;

    this.processingRejectId.set(item.inscripcion_id);

    this.service
      .rechazar(item.inscripcion_id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.processingRejectId.set(null);
          this.removeFromList(item.inscripcion_id);
          this.messageService.add({
            severity: 'success',
            summary: 'Inscripción rechazada',
            detail: `${item.alumno_apellido}, ${item.alumno_nombre} fue rechazado`,
            life: 3000,
          });
        },
        error: () => {
          this.processingRejectId.set(null);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo rechazar la inscripción',
            life: 3500,
          });
        },
      });
  }

  private loadPendientes() {
    this.loading.set(true);
    this.error.set(null);

    this.service
      .getPendientes()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.pendientes.set(res.pendientes);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('No se pudieron cargar las inscripciones pendientes');
          this.loading.set(false);
        },
      });
  }

  private removeFromList(inscripcionId: number) {
    this.pendientes.update((list) =>
      list.filter((p) => p.inscripcion_id !== inscripcionId)
    );
  }
}
