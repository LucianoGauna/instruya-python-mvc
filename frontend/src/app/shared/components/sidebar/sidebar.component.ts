import { Component, ChangeDetectionStrategy, input, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SidebarMenuItem } from '../../types/sidebar.types';

@Component({
  selector: 'app-sidebar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  open = input<boolean>(false);

  menuItems = input<SidebarMenuItem[]>([]);

  private router = inject(Router);

  navigate(route: string) {
    this.router.navigate([route]);
  }
}
