import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { SidebarMenuItem } from '../../../shared/types/sidebar.types';

@Component({
  selector: 'app-docente-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, SidebarComponent],
  templateUrl: './docente-layout.component.html',
})
export class DocenteLayoutComponent {
  sidebarOpen = signal(false);

  menuItems = signal<SidebarMenuItem[]>([
    { label: 'Inicio', icon: 'pi pi-home', route: '/docente/inicio' },
    {
      label: 'Mis materias',
      icon: 'pi pi-book',
      route: '/docente/mis-materias',
    },
  ]);

  toggleSidebar() {
    this.sidebarOpen.update((v) => !v);
  }
}
