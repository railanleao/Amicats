import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import { AccessType } from '../../models/auth.model';
import { ACCESS_TYPE_LABELS, User } from '../../models/user.model';
import { UserService } from '../../services/resources/user.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [ConfirmDialogComponent],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css',
})
export class UsersComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly users = signal<User[]>([]);
  readonly deactivatingId = signal<number | null>(null);
  readonly userPendingDeactivation = signal<User | null>(null);

  showFilters = false;
  searchTerm = '';
  selectedProfile = '';
  selectedStatus = '';

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.userService
      .list()
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (users) => this.users.set(users),
        error: () =>
          this.errorMessage.set('Não foi possível carregar os usuários. Tente novamente.'),
      });
  }

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

  profileLabel(accessType: AccessType): string {
    return ACCESS_TYPE_LABELS[accessType];
  }

  get filteredUsers(): User[] {
    const search = this.searchTerm.toLowerCase().trim();

    return this.users().filter((user) => {
      const matchesSearch =
        user.fullName.toLowerCase().includes(search) || user.email.toLowerCase().includes(search);

      const matchesProfile = !this.selectedProfile || user.accessType === this.selectedProfile;

      const matchesStatus =
        !this.selectedStatus || (this.selectedStatus === 'Active') === user.active;

      return matchesSearch && matchesProfile && matchesStatus;
    });
  }

  requestDeactivation(user: User): void {
    if (!user.active || this.deactivatingId() !== null) {
      return;
    }

    this.userPendingDeactivation.set(user);
  }

  cancelDeactivation(): void {
    this.userPendingDeactivation.set(null);
  }

  confirmDeactivation(): void {
    const user = this.userPendingDeactivation();
    if (!user) {
      return;
    }

    this.deactivatingId.set(user.id);

    this.userService
      .deactivate(user.id)
      .pipe(
        finalize(() => this.deactivatingId.set(null)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.users.update((users) =>
            users.map((u) => (u.id === user.id ? { ...u, active: false } : u)),
          );
          this.userPendingDeactivation.set(null);
        },
        error: () => {
          this.errorMessage.set('Não foi possível desativar o usuário. Tente novamente.');
          this.userPendingDeactivation.set(null);
        },
      });
  }
}
