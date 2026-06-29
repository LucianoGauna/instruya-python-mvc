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
  AlumnoCalificacionesService,
  MiCalificacion,
} from '../../services/alumno-calificaciones.service';

@Component({
  selector: 'app-alumno-mis-calificaciones',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './mis-calificaciones.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MisCalificacionesComponent {
  private service = inject(AlumnoCalificacionesService);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);

  loading = signal(true);
  error = signal<string | null>(null);
  calificaciones = signal<MiCalificacion[]>([]);

  ngOnInit() {
    this.loading.set(true);
    this.error.set(null);

    this.service
      .getMisCalificaciones()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.calificaciones.set(res.calificaciones);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('No se pudieron cargar tus calificaciones');
          this.loading.set(false);
        },
      });
  }

  goBack() {
    this.router.navigate(['/alumno/inicio']);
  }
}
