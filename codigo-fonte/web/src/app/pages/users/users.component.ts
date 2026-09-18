import { Component } from '@angular/core';

import { DashboardLayoutComponent } from '../../components/auth-layout/dashboard-layout.component';

export interface User {
  name: string;
  email: string;
  phone: string;
  profile: string;
  status: string;
  photo?: string;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [DashboardLayoutComponent],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css',
})
export class UsersComponent {
  users: User[] = [];
}
