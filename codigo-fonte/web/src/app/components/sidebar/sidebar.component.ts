import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { ACCESS_TYPE_LABELS } from '../../models/user.model';
import { AuthService } from '../../services/resources/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly currentUser = this.authService.currentUser;

  readonly profileLabel = computed(() => {
    const user = this.currentUser();
    return user ? ACCESS_TYPE_LABELS[user.accessType] : '';
  });

  disconnect(): void {
    this.authService.clearSession();
    this.router.navigate(['/login']);
  }
}
