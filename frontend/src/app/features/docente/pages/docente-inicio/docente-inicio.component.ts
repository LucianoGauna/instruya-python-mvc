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
import { DocenteDashboardResumen } from '../../types/docente.types';
import { DocenteService } from '../../services/docente.service';

@Component({
  standalone: true,
  selector: 'app-docente-inicio',
  imports: [CommonModule, ButtonModule],
  templateUrl: './docente-inicio.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocenteInicioComponent {
  private router = inject(Router);
  private docenteService = inject(DocenteService);
  private auth = inject(AuthService);
  private destroyRef = inject(DestroyRef);

  user = this.auth.user;
  loading = signal(true);
  error = signal<string | null>(null);
  resumen = signal<DocenteDashboardResumen | null>(null);

  ngOnInit() {
    this.getDashboardResumen();
  }

  goToMisMaterias() {
    this.router.navigate(['/docente/mis-materias']);
  }

  private getDashboardResumen() {
    this.docenteService
      .getDashboardResumen()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.resumen.set(res.resumen);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('No se pudo cargar el resumen docente');
          this.loading.set(false);
        },
      });
  }
}
