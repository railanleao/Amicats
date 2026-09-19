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
  showFilters = false;

  searchTerm = '';
  selectedProfile = '';
  selectedStatus = '';

  users: User[] = [
    {
      name: 'Joaquim Valente',
      email: 'joaquim.valente@email.com',
      phone: '(31) 99999-9999',
      profile: 'Administrator',
      status: 'Active',
    },
    {
      name: 'Pedro Silva',
      email: 'pedro.silva@email.com',
      phone: '(31) 98888-8888',
      profile: 'Veterinary',
      status: 'Inactive',
    },
    {
      name: 'Amanda Silva',
      email: 'amanda.silva@email.com',
      phone: '(31) 98888-8888',
      profile: 'Volunteer',
      status: 'Active',
    },
  ];

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value;
  }

  onProfileChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedProfile = select.value;
  }

  onStatusChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedStatus = select.value;
  }

  get filteredUsers(): User[] {
    const search = this.searchTerm.toLowerCase().trim();

    return this.users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search);

      const matchesProfile =
        !this.selectedProfile || user.profile === this.selectedProfile;

      const matchesStatus =
        !this.selectedStatus || user.status === this.selectedStatus;

      return matchesSearch && matchesProfile && matchesStatus;
    });
  }

  toggleUserStatus(user: User): void {
    user.status = user.status === 'Active' ? 'Inactive' : 'Active';
  }
}
