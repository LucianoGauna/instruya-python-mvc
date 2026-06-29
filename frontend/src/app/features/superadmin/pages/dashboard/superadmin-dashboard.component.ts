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
import { AuthService } from '../../../../core/auth/auth.service';
import {
  AdminDeInstitucion,
  Institucion,
  SuperadminInstitucionesService,
} from '../../services/superadmin-instituciones.service';
import { forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

@Component({
  standalone: true,
  selector: 'app-superadmin-dashboard',
  imports: [CommonModule, ButtonModule],
  templateUrl: './superadmin-dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SuperadminDashboardComponent {
  private service = inject(SuperadminInstitucionesService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  loading = signal(true);
  error = signal<string | null>(null);
  user = this.auth.user;

  totalInstituciones = signal(0);
  institucionesActivas = signal(0);
  institucionesInactivas = signal(0);
  totalAdmins = signal(0);
  adminsActivos = signal(0);
  adminsInactivos = signal(0);
  ultimasInstituciones = signal<Institucion[]>([]);

  ngOnInit() {
    this.loadResumen();
  }

  goToInstituciones() {
    this.router.navigate(['/superadmin/instituciones']);
  }

  private loadResumen() {
    this.loading.set(true);
    this.error.set(null);

    this.service
      .getInstituciones()
      .pipe(
        switchMap((res) => {
          const instituciones = res.instituciones ?? [];
          if (instituciones.length === 0) {
            return of({ instituciones, admins: [] as AdminDeInstitucion[] });
          }

          const requests = instituciones.map((i) =>
            this.service.getAdminsByInstitucion(i.id).pipe(
              map((r) => r.admins ?? []),
              catchError(() => of([] as AdminDeInstitucion[]))
            )
          );

          return forkJoin(requests).pipe(
            map((adminsPorInstitucion) => ({
              instituciones,
              admins: adminsPorInstitucion.flat(),
            }))
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: ({ instituciones, admins }) => {
          this.totalInstituciones.set(instituciones.length);
          this.institucionesActivas.set(
            instituciones.filter((i) => i.activa === 1).length
          );
          this.institucionesInactivas.set(
            instituciones.filter((i) => i.activa !== 1).length
          );

          this.totalAdmins.set(admins.length);
          this.adminsActivos.set(admins.filter((a) => a.activo === 1).length);
          this.adminsInactivos.set(admins.filter((a) => a.activo !== 1).length);

          const ultimas = [...instituciones]
            .sort(
              (a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
            )
            .slice(0, 5);
          this.ultimasInstituciones.set(ultimas);

          this.loading.set(false);
        },
        error: () => {
          this.error.set('No se pudo cargar el resumen del dashboard');
          this.loading.set(false);
        },
      });
  }
}
