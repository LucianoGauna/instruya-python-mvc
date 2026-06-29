import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  PLATFORM_ID,
  inject,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../../../core/auth/auth.service';
import { AlumnoService } from '../../services/alumno.service';
import { AlumnoDashboardResumen } from '../../types/alumno.types';
import { ChartModule } from 'primeng/chart';
import { AlumnoCalificacionesService } from '../../services/alumno-calificaciones.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-alumno-inicio',
  standalone: true,
  imports: [CommonModule, ButtonModule, ChartModule],
  templateUrl: './alumno-inicio.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlumnoInicioComponent {
  private alumnoService = inject(AlumnoService);
  private alumnoCalificacionesService = inject(AlumnoCalificacionesService);
  private auth = inject(AuthService);
  private destroyRef = inject(DestroyRef);
  private cd = inject(ChangeDetectorRef);
  private platformId = inject(PLATFORM_ID);

  user = this.auth.user;
  loading = signal(true);
  error = signal<string | null>(null);
  resumen = signal<AlumnoDashboardResumen | null>(null);
  doughnutData: any = null;
  doughnutOptions: any = null;
  barData: any = null;
  barOptions: any = null;

  ngOnInit() {
    forkJoin({
      resumen: this.alumnoService.getDashboardResumen(),
      calificaciones: this.alumnoCalificacionesService.getMisCalificaciones(),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ resumen, calificaciones }) => {
          this.resumen.set(resumen.resumen);
          this.initDoughnutChart();
          this.initBarChart(calificaciones.calificaciones);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('No se pudo cargar el resumen del alumno');
          this.loading.set(false);
        },
      });
  }

  private initDoughnutChart() {
    const resumen = this.resumen();
    if (!resumen || !isPlatformBrowser(this.platformId)) return;

    const aprobadas = resumen.materias.aprobadas;
    const desaprobadas = resumen.materias.desaprobadas;

    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--p-text-color');

    this.doughnutData = {
      labels: ['Aprobadas', 'Desaprobadas'],
      datasets: [
        {
          data: [aprobadas, desaprobadas],
          backgroundColor: ['#4D7FB3', '#94B2D1'],
          hoverBackgroundColor: ['#4D7FB3', '#94B2D1'],
        },
      ],
    };

    this.doughnutOptions = {
      cutout: '60%',
      plugins: {
        legend: {
          labels: {
            color: textColor,
          },
        },
      },
    };

    this.cd.markForCheck();
  }

  private initBarChart(
    calificaciones: Array<{
      calificacion_id: number;
      tipo: string;
      fecha: string;
      nota: string;
      materia_id: number;
      materia_nombre: string;
    }>,
  ) {
    if (!isPlatformBrowser(this.platformId)) return;

    const notaDefinitivaPorMateria = new Map<
      number,
      { materia_nombre: string; nota: number; fechaTs: number }
    >();
    for (const calificacion of calificaciones) {
      if (calificacion.tipo !== 'NOTA_MATERIA') continue;
      const nota = Number(calificacion.nota);
      if (Number.isNaN(nota)) continue;

      const fechaTs = Date.parse(calificacion.fecha) || 0;
      const actual = notaDefinitivaPorMateria.get(calificacion.materia_id);
      if (!actual || fechaTs >= actual.fechaTs) {
        notaDefinitivaPorMateria.set(calificacion.materia_id, {
          materia_nombre: calificacion.materia_nombre,
          nota,
          fechaTs,
        });
      }
    }

    const finales = Array.from(notaDefinitivaPorMateria.values()).sort((a, b) =>
      a.materia_nombre.localeCompare(b.materia_nombre, 'es'),
    );

    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--p-text-color');
    const textColorSecondary = documentStyle.getPropertyValue(
      '--p-text-muted-color',
    );
    const surfaceBorder = documentStyle.getPropertyValue(
      '--p-content-border-color',
    );

    if (finales.length === 0) {
      this.barData = null;
      this.barOptions = null;
      this.cd.markForCheck();
      return;
    }
    const fullLabels = finales.map((final) => final.materia_nombre);

    this.barData = {
      labels: fullLabels.map((nombre) =>
        nombre.length > 10 ? `${nombre.substring(0, 10)}...` : nombre,
      ),
      datasets: [
        {
          label: 'Nota final',
          data: finales.map((final) => final.nota),
          backgroundColor: 'rgba(77, 127, 179, 0.25)',
          borderColor: '#4D7FB3',
          borderWidth: 1,
          maxBarThickness: 70,
        },
      ],
    };

    this.barOptions = {
      plugins: {
        legend: {
          labels: {
            color: textColor,
          },
        },
        tooltip: {
          callbacks: {
            title: (items: any[]) => {
              const index = items?.[0]?.dataIndex ?? -1;
              return fullLabels[index] ?? '';
            },
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: textColorSecondary,
          },
          grid: {
            color: surfaceBorder,
          },
        },
        y: {
          beginAtZero: true,
          min: 0,
          max: 10,
          ticks: {
            color: textColorSecondary,
            stepSize: 1,
          },
          grid: {
            color: surfaceBorder,
          },
        },
      },
    };

    this.cd.markForCheck();
  }
}
