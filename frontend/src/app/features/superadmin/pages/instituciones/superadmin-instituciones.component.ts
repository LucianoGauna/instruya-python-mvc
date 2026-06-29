import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import {
  AdminDeInstitucion,
  Institucion,
  SuperadminInstitucionesService,
} from '../../services/superadmin-instituciones.service';
import { Tooltip } from 'primeng/tooltip';

@Component({
  selector: 'app-superadmin-instituciones',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    ToastModule,
    Tooltip,
  ],
  providers: [MessageService],
  templateUrl: './superadmin-instituciones.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SuperadminInstitucionesComponent {
  private service = inject(SuperadminInstitucionesService);
  private destroyRef = inject(DestroyRef);
  private messageService = inject(MessageService);

  loading = signal(true);
  error = signal<string | null>(null);
  instituciones = signal<Institucion[]>([]);

  creating = signal(false);
  updatingId = signal<number | null>(null);
  editingId = signal<number | null>(null);

  nombreInst = signal('');
  emailInst = signal('');
  direccionInst = signal('');
  adminNombre = signal('');
  adminApellido = signal('');
  adminEmail = signal('');
  adminPass = signal('');

  editNombre = signal('');
  editEmail = signal('');
  editDireccion = signal('');

  adminDialogVisible = signal(false);
  adminTargetInstitucion = signal<Institucion | null>(null);
  creatingAdmin = signal(false);
  newAdminNombre = signal('');
  newAdminApellido = signal('');
  newAdminEmail = signal('');
  newAdminPass = signal('');

  viewAdminsDialogVisible = signal(false);
  viewAdminsTargetInstitucion = signal<Institucion | null>(null);
  loadingAdmins = signal(false);
  adminsError = signal<string | null>(null);
  admins = signal<AdminDeInstitucion[]>([]);
  updatingAdminId = signal<number | null>(null);

  ngOnInit() {
    this.loadInstituciones();
  }

  isActiva(i: Institucion): boolean {
    return i.activa === 1;
  }

  create() {
    const nombre = this.nombreInst().trim();
    const email = this.emailInst().trim();
    const direccionRaw = this.direccionInst().trim();
    const aNombre = this.adminNombre().trim();
    const aApellido = this.adminApellido().trim();
    const aEmail = this.adminEmail().trim();
    const aPass = this.adminPass();

    if (
      !nombre ||
      !email ||
      !direccionRaw ||
      !aNombre ||
      !aApellido ||
      !aEmail ||
      !aPass
    ) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Faltan datos',
        detail: 'Completá institución y admin',
        life: 3000,
      });
      return;
    }

    if (!this.isValidEmail(email)) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Email inválido',
        detail: 'Ingresá un email válido para la institución',
        life: 3000,
      });
      return;
    }
    if (!this.isValidEmail(aEmail)) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Email inválido',
        detail: 'Ingresá un email válido para el administrador',
        life: 3000,
      });
      return;
    }

    this.creating.set(true);

    this.service
      .createInstitucion({
        institucion: {
          nombre,
          email,
          direccion: direccionRaw,
        },
        admin: {
          nombre: aNombre,
          apellido: aApellido,
          email: aEmail,
          contrasenia: aPass,
        },
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.creating.set(false);
          this.clearCreateForm();
          this.messageService.add({
            severity: 'success',
            summary: 'Institución creada',
            detail: 'Se creó la institución y su admin',
            life: 3000,
          });
          this.loadInstituciones();
        },
        error: (err) => {
          this.creating.set(false);
          const detail =
            err?.status === 409
              ? 'Nombre o email duplicado de institución/admin'
              : err?.status === 400
                ? 'Datos inválidos'
                : 'No se pudo crear la institución';
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail,
            life: 3500,
          });
        },
      });
  }

  startEdit(i: Institucion) {
    this.editingId.set(i.id);
    this.editNombre.set(i.nombre);
    this.editEmail.set(i.email);
    this.editDireccion.set(i.direccion ?? '');
  }

  cancelEdit() {
    this.editingId.set(null);
    this.editNombre.set('');
    this.editEmail.set('');
    this.editDireccion.set('');
  }

  saveEdit(i: Institucion) {
    const nombre = this.editNombre().trim();
    const email = this.editEmail().trim();
    const direccion = this.editDireccion().trim();

    if (!nombre || !email || !direccion) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Faltan datos',
        detail: 'Nombre, email y dirección son requeridos',
        life: 3000,
      });
      return;
    }

    if (!this.isValidEmail(email)) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Email inválido',
        detail: 'Ingresá un email válido para la institución',
        life: 3000,
      });
      return;
    }

    this.updatingId.set(i.id);

    this.service
      .updateInstitucion(i.id, {
        nombre,
        email,
        direccion,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.updatingId.set(null);
          this.cancelEdit();
          this.messageService.add({
            severity: 'success',
            summary: 'Institución actualizada',
            detail: 'Se guardaron los cambios',
            life: 3000,
          });
          this.loadInstituciones();
        },
        error: (err) => {
          this.updatingId.set(null);
          const detail =
            err?.status === 409
              ? 'Email/nombre duplicado'
              : err?.status === 404
                ? 'Institución no encontrada'
                : 'No se pudo actualizar';
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail,
            life: 3500,
          });
        },
      });
  }

  activar(i: Institucion) {
    this.updatingId.set(i.id);
    this.service
      .activarInstitucion(i.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.updatingId.set(null);
          this.messageService.add({
            severity: 'success',
            summary: 'Institución activada',
            detail: i.nombre,
            life: 3000,
          });
          this.loadInstituciones();
        },
        error: () => {
          this.updatingId.set(null);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo activar',
            life: 3500,
          });
        },
      });
  }

  desactivar(i: Institucion) {
    this.updatingId.set(i.id);
    this.service
      .desactivarInstitucion(i.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.updatingId.set(null);
          this.messageService.add({
            severity: 'success',
            summary: 'Institución desactivada',
            detail: i.nombre,
            life: 3000,
          });
          this.loadInstituciones();
        },
        error: () => {
          this.updatingId.set(null);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo desactivar',
            life: 3500,
          });
        },
      });
  }

  openAdminDialog(i: Institucion) {
    this.adminTargetInstitucion.set(i);
    this.newAdminNombre.set('');
    this.newAdminApellido.set('');
    this.newAdminEmail.set('');
    this.newAdminPass.set('');
    this.adminDialogVisible.set(true);
  }

  closeAdminDialog() {
    this.adminDialogVisible.set(false);
    this.adminTargetInstitucion.set(null);
    this.creatingAdmin.set(false);
    this.newAdminNombre.set('');
    this.newAdminApellido.set('');
    this.newAdminEmail.set('');
    this.newAdminPass.set('');
  }

  createAdmin() {
    const target = this.adminTargetInstitucion();
    if (!target) return;

    if (!this.isActiva(target)) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Institución inactiva',
        detail: 'Activá la institución antes de crear admins',
        life: 3000,
      });
      return;
    }

    const nombre = this.newAdminNombre().trim();
    const apellido = this.newAdminApellido().trim();
    const email = this.newAdminEmail().trim();
    const contrasenia = this.newAdminPass();

    if (!nombre || !apellido || !email || !contrasenia) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Faltan datos',
        detail: 'Completá nombre, apellido, email y contraseña',
        life: 3000,
      });
      return;
    }

    if (!this.isValidEmail(email)) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Email inválido',
        detail: 'Ingresá un email válido para el administrador',
        life: 3000,
      });
      return;
    }

    if (contrasenia.length < 6) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Contraseña inválida',
        detail: 'Debe tener al menos 6 caracteres',
        life: 3000,
      });
      return;
    }

    this.creatingAdmin.set(true);

    this.service
      .createAdminEnInstitucion(target.id, {
        nombre,
        apellido,
        email,
        contrasenia,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.creatingAdmin.set(false);
          this.messageService.add({
            severity: 'success',
            summary: 'Administrador creado',
            detail: `Se creó el admin para ${target.nombre}`,
            life: 3000,
          });
          this.closeAdminDialog();
        },
        error: (err) => {
          this.creatingAdmin.set(false);
          const detail =
            err?.status === 409
              ? (err?.error?.message ??
                'Email duplicado o institución inactiva')
              : err?.status === 404
                ? 'Institución no encontrada'
                : err?.status === 400
                  ? (err?.error?.message ?? 'Datos inválidos')
                  : 'No se pudo crear el administrador';
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail,
            life: 3500,
          });
        },
      });
  }

  openViewAdminsDialog(i: Institucion) {
    this.viewAdminsTargetInstitucion.set(i);
    this.viewAdminsDialogVisible.set(true);
    this.loadAdminsByInstitucion(i.id);
  }

  closeViewAdminsDialog() {
    this.viewAdminsDialogVisible.set(false);
    this.viewAdminsTargetInstitucion.set(null);
    this.loadingAdmins.set(false);
    this.adminsError.set(null);
    this.admins.set([]);
    this.updatingAdminId.set(null);
  }

  toggleAdminActivo(admin: AdminDeInstitucion) {
    const institucion = this.viewAdminsTargetInstitucion();
    if (!institucion) return;

    this.updatingAdminId.set(admin.id);

    const request$ =
      admin.activo === 1
        ? this.service.desactivarAdmin(admin.id)
        : this.service.activarAdmin(admin.id);

    request$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.updatingAdminId.set(null);
        this.messageService.add({
          severity: 'success',
          summary: admin.activo === 1 ? 'Admin desactivado' : 'Admin activado',
          detail: `${admin.apellido}, ${admin.nombre}`,
          life: 3000,
        });
        this.loadAdminsByInstitucion(institucion.id);
      },
      error: (err) => {
        this.updatingAdminId.set(null);
        const detail =
          err?.status === 404
            ? 'Administrador no encontrado'
            : err?.status === 400
              ? 'adminId inválido'
              : 'No se pudo actualizar el estado del admin';
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail,
          life: 3500,
        });
      },
    });
  }

  private loadInstituciones() {
    this.loading.set(true);
    this.error.set(null);

    this.service
      .getInstituciones()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.instituciones.set(res.instituciones);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('No se pudieron cargar las instituciones');
          this.loading.set(false);
        },
      });
  }

  private loadAdminsByInstitucion(institucionId: number) {
    this.loadingAdmins.set(true);
    this.adminsError.set(null);
    this.admins.set([]);

    this.service
      .getAdminsByInstitucion(institucionId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.admins.set(res.admins);
          this.loadingAdmins.set(false);
        },
        error: () => {
          this.adminsError.set('No se pudieron cargar los administradores');
          this.loadingAdmins.set(false);
        },
      });
  }

  private clearCreateForm() {
    this.nombreInst.set('');
    this.emailInst.set('');
    this.direccionInst.set('');
    this.adminNombre.set('');
    this.adminApellido.set('');
    this.adminEmail.set('');
    this.adminPass.set('');
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
