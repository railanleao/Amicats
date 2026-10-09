import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { ACCESS_TYPE_LABELS } from '../../models/user.model';
import { AuthService } from '../../services/resources/auth.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, IconComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly currentUser = this.authService.currentUser;

  readonly isAdministrator = computed(
    () => this.currentUser()?.accessType === 'Administrator',
  );

  readonly profileLabel = computed(() => {
    const user = this.currentUser();
    return user ? ACCESS_TYPE_LABELS[user.accessType] : '';
  });

  readonly canViewStock = computed(() => {
    const accessType = this.currentUser()?.accessType;

    return (
      accessType === 'Administrator' ||
      accessType === 'Assistant' ||
      accessType === 'Veterinarian'
    );
  });

  disconnect(): void {
    this.authService.clearSession();
    this.router.navigate(['/login']);
  }
}
