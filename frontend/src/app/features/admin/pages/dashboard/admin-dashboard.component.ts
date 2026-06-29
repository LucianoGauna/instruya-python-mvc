import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../../../core/auth/auth.service';
import {
  AdminDashboardResumen,
  AdminDashboardService,
} from '../../services/admin-dashboard.service';

@Component({
  standalone: true,
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  imports: [CommonModule, ButtonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboardComponent {
  private service = inject(AdminDashboardService);
  private auth = inject(AuthService);
  private destroyRef = inject(DestroyRef);

  user = this.auth.user;
  loading = signal(true);
  error = signal<string | null>(null);
  resumen = signal<AdminDashboardResumen | null>(null);

  ngOnInit() {
    this.service
      .getResumen()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.resumen.set(res.resumen);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('No se pudo cargar el resumen del dashboard');
          this.loading.set(false);
        },
      });
  }
}
