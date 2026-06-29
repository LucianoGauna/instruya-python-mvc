import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { DocenteService } from '../../services/docente.service';
import { DocenteMateria } from '../../types/docente.types';

@Component({
  standalone: true,
  selector: 'app-docente-mis-materias',
  imports: [CommonModule, ButtonModule],
  templateUrl: './docente-materias.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocenteMateriasComponent {
  private docenteService = inject(DocenteService);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);

  loading = signal(true);
  error = signal<string | null>(null);
  materias = signal<DocenteMateria[]>([]);

  ngOnInit() {
    this.loading.set(true);
    this.error.set(null);

    this.docenteService
      .getMisMaterias()
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
    this.router.navigate(['/docente/inicio']);
  }  

  verInscriptos(m: DocenteMateria) {
    this.router.navigate(['/docente/mis-materias', m.materia_id, 'inscriptos']);
  }
}
