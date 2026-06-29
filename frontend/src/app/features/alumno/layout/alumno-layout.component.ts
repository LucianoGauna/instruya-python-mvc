import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { SidebarMenuItem } from '../../../shared/types/sidebar.types';

@Component({
  selector: 'app-alumno-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, SidebarComponent],
  templateUrl: './alumno-layout.component.html',
})
export class AlumnoLayoutComponent {
  sidebarOpen = signal(false);

  menuItems = signal<SidebarMenuItem[]>([
    { label: 'Inicio', icon: 'pi pi-home', route: '/alumno/inicio' },
    {
      label: 'Catalogo',
      icon: 'pi pi-list',
      route: '/alumno/catalogo',
    },
    {
      label: 'Mis materias',
      icon: 'pi pi-book',
      route: '/alumno/mis-materias',
    },
    {
      label: 'Mis calificaciones',
      icon: 'pi pi-star',
      route: '/alumno/mis-calificaciones',
    },
  ]);

  toggleSidebar() {
    this.sidebarOpen.update((v) => !v);
  }
}
