import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AlumnoService } from '../../services/alumno.service';
import { MiMateria } from '../../types/alumno.types';
import { Router } from '@angular/router';
import { Button } from "primeng/button";

@Component({
  selector: 'app-alumno-mis-materias',
  standalone: true,
  imports: [CommonModule, Button],
  templateUrl: './mis-materias.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlumnoMisMateriasComponent {
  private alumnoService = inject(AlumnoService);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);

  loading = signal(true);
  error = signal<string | null>(null);
  materias = signal<MiMateria[]>([]);

  ngOnInit() {
    this.loading.set(true);
    this.error.set(null);

    this.alumnoService
      .getMaterias()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.materias.set(res.materias);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('No se pudieron cargar tus materias');
          this.loading.set(false);
        },
      });
  }

  goBack() {
    this.router.navigate(['/alumno/inicio']);
  }
}
