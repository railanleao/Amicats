import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../app/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  userLogged = {
    name: 'Camila Andrade',
    profile: 'Administradora',
  };

  constructor(
    private router: Router,
    private authService: AuthService,
  ) {}

  disconnect(): void {
    this.authService.clearSession();
    this.router.navigate(['/login']);
  }
}
