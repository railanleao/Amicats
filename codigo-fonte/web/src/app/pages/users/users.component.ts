import {Component, DestroyRef, OnDestroy, OnInit, inject, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {Subject, debounceTime, distinctUntilChanged, finalize} from 'rxjs';

import {ConfirmDialogComponent} from '../../components/confirm-dialog/confirm-dialog.component';
import {PaginationComponent} from '../../components/pagination/pagination.component';
import {AccessType} from '../../models/auth.model';
import {ACCESS_TYPE_LABELS, User} from '../../models/user.model';
import {UserService} from '../../services/resources/user.service';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [ConfirmDialogComponent, PaginationComponent],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css',
})
export class UsersComponent implements OnInit, OnDestroy {
  private readonly userService = inject(UserService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly searchInput$ = new Subject<string>();

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly users = signal<User[]>([]);
  readonly page = signal(0);
  readonly totalElements = signal(0);
  readonly totalPages = signal(0);
  readonly pageSize = PAGE_SIZE;
  readonly deactivatingId = signal<number | null>(null);
  readonly activatingId = signal<number | null>(null);
  readonly userPendingDeactivation = signal<User | null>(null);
  readonly userPendingReactivation = signal<User | null>(null);

  showFilters = false;
  searchTerm = '';
  selectedProfile = '';
  selectedStatus = '';

  ngOnInit(): void {
    this.searchInput$
      .pipe(debounceTime(SEARCH_DEBOUNCE_MS), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((term) => {
        this.searchTerm = term;
        this.page.set(0);
        this.loadUsers();
      });

    this.loadUsers();
  }

  ngOnDestroy(): void {
    this.searchInput$.complete();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.userService
      .list({
        search: this.searchTerm || undefined,
        accessType: (this.selectedProfile as AccessType) || undefined,
        active: this.selectedStatus ? this.selectedStatus === 'Active' : undefined,
        page: this.page(),
        size: this.pageSize,
      })
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (result) => {
          this.users.set(result.content);
          this.totalElements.set(result.totalElements);
          this.totalPages.set(result.totalPages);
        },
        error: () =>
          this.errorMessage.set('Não foi possível carregar os usuários. Tente novamente.'),
      });
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchInput$.next(input.value);
  }

  onProfileChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedProfile = select.value;
    this.page.set(0);
    this.loadUsers();
  }

  onStatusChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedStatus = select.value;
    this.page.set(0);
    this.loadUsers();
  }

  onPageChange(page: number): void {
    this.page.set(page);
    this.loadUsers();
  }

  profileLabel(accessType: AccessType): string {
    return ACCESS_TYPE_LABELS[accessType];
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
          this.userPendingDeactivation.set(null);
          this.loadUsers();
        },
        error: () => {
          this.errorMessage.set('Não foi possível desativar o usuário. Tente novamente.');
          this.userPendingDeactivation.set(null);
        },
      });
  }

  requestReactivation(user: User): void {
    if (user.active || this.activatingId() !== null) {
      return;
    }

    this.userPendingReactivation.set(user);
  }

  cancelReactivation(): void {
    this.userPendingReactivation.set(null);
  }

  confirmReactivation(): void {
    const user = this.userPendingReactivation();
    if (!user) {
      return;
    }

    this.activatingId.set(user.id);
    this.errorMessage.set(null);

    this.userService
      .activate(user.id)
      .pipe(
        finalize(() => this.activatingId.set(null)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.userPendingReactivation.set(null);
          this.loadUsers();
        },
        error: () => {
          this.errorMessage.set('Não foi possível reativar o usuário. Tente novamente.');
          this.userPendingReactivation.set(null);
        },
      });
  }
}
