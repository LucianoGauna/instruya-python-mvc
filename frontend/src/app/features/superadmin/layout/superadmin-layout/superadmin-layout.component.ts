import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar.component';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { SidebarMenuItem } from '../../../../shared/types/sidebar.types';

@Component({
  selector: 'app-superadmin-layout',
  imports: [RouterOutlet, NavbarComponent, SidebarComponent],
  templateUrl: './superadmin-layout.component.html',
})
export class SuperadminLayoutComponent {
  sidebarOpen = signal(false);

  menuItems: SidebarMenuItem[] = [
    { label: 'Dashboard', icon: 'pi pi-home', route: '/superadmin/dashboard' },
    {
      label: 'Instituciones',
      icon: 'pi pi-building',
      route: '/superadmin/instituciones',
    },
  ];

  toggleSidebar() {
    this.sidebarOpen.update((v) => !v);
  }
}
