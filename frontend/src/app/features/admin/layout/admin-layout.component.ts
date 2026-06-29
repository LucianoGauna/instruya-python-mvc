import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { SidebarMenuItem } from '../../../shared/types/sidebar.types';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, SidebarComponent],
  templateUrl: './admin-layout.component.html',
})
export class AdminLayoutComponent {
  sidebarOpen = signal(false);

  menuItems = signal<SidebarMenuItem[]>([
    { label: 'Dashboard', icon: 'pi pi-home', route: '/admin/dashboard' },
    { label: 'Carreras', icon: 'pi pi-book', route: '/admin/carreras' },
    {
      label: 'Inscripciones',
      icon: 'pi pi-inbox',
      route: '/admin/inscripciones-pendientes',
    },
  ]);

  toggleSidebar() {
    this.sidebarOpen.update((v) => !v);
  }
}
