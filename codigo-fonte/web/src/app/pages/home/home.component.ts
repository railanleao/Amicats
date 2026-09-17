import { Component, inject } from '@angular/core';

import { AuthService } from '../../services/resources/auth.service';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.component.html',
})
export class HomeComponent {
  private readonly authService = inject(AuthService);

  readonly currentUser = this.authService.currentUser;
}
