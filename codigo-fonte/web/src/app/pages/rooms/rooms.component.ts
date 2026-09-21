import { Component, DestroyRef, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, finalize } from 'rxjs';

import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import { PaginationComponent } from '../../components/pagination/pagination.component';
import { ToggleComponent } from '../../components/toggle/toggle.component';
import { Room } from '../../models/room.model';
import { RoomService } from '../../services/resources/room.service';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [ConfirmDialogComponent, PaginationComponent, ToggleComponent],
  templateUrl: './rooms.component.html',
  styleUrl: './rooms.component.css',
})
export class RoomsComponent implements OnInit, OnDestroy {
  private readonly roomService = inject(RoomService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly searchInput$ = new Subject<string>();

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly rooms = signal<Room[]>([]);
  readonly page = signal(0);
  readonly totalElements = signal(0);
  readonly totalPages = signal(0);
  readonly pageSize = PAGE_SIZE;
  readonly deactivatingId = signal<number | null>(null);
  readonly activatingId = signal<number | null>(null);
  readonly roomPendingDeactivation = signal<Room | null>(null);
  readonly roomPendingReactivation = signal<Room | null>(null);

  showFilters = false;
  searchTerm = '';
  selectedStatus = '';

  ngOnInit(): void {
    this.searchInput$
      .pipe(
        debounceTime(SEARCH_DEBOUNCE_MS),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((term) => {
        this.searchTerm = term;
        this.page.set(0);
        this.loadRooms();
      });

    this.loadRooms();
  }

  ngOnDestroy(): void {
    this.searchInput$.complete();
  }

  loadRooms(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.roomService
      .list({
        search: this.searchTerm || undefined,
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
          this.rooms.set(result.content);
          this.totalElements.set(result.totalElements);
          this.totalPages.set(result.totalPages);
        },
        error: () =>
          this.errorMessage.set('Não foi possível carregar as salas. Tente novamente.'),
      });
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchInput$.next(input.value);
  }

  onStatusChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedStatus = select.value;
    this.page.set(0);
    this.loadRooms();
  }

  onPageChange(page: number): void {
    this.page.set(page);
    this.loadRooms();
  }

  capacityLabel(room: Room): string {
    return room.maxCapacity != null ? `${room.maxCapacity} gatos` : '—';
  }

  createRoom(): void {
    void this.router.navigate(['/rooms/new']);
  }

  editRoom(room: Room): void {
    void this.router.navigate(['/rooms', room.id, 'edit']);
  }

  onToggleStatus(room: Room): void {
    if (room.active) {
      this.requestDeactivation(room);
    } else {
      this.requestReactivation(room);
    }
  }

  requestDeactivation(room: Room): void {
    if (!room.active || this.deactivatingId() !== null) {
      return;
    }

    this.roomPendingDeactivation.set(room);
  }

  cancelDeactivation(): void {
    this.roomPendingDeactivation.set(null);
  }

  confirmDeactivation(): void {
    const room = this.roomPendingDeactivation();
    if (!room) {
      return;
    }

    this.deactivatingId.set(room.id);

    this.roomService
      .deactivate(room.id)
      .pipe(
        finalize(() => this.deactivatingId.set(null)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.roomPendingDeactivation.set(null);
          this.loadRooms();
        },
        error: () => {
          this.errorMessage.set('Não foi possível desativar a sala. Tente novamente.');
          this.roomPendingDeactivation.set(null);
        },
      });
  }

  requestReactivation(room: Room): void {
    if (room.active || this.activatingId() !== null) {
      return;
    }

    this.roomPendingReactivation.set(room);
  }

  cancelReactivation(): void {
    this.roomPendingReactivation.set(null);
  }

  confirmReactivation(): void {
    const room = this.roomPendingReactivation();
    if (!room) {
      return;
    }

    this.activatingId.set(room.id);
    this.errorMessage.set(null);

    this.roomService
      .activate(room.id)
      .pipe(
        finalize(() => this.activatingId.set(null)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.roomPendingReactivation.set(null);
          this.loadRooms();
        },
        error: () => {
          this.errorMessage.set('Não foi possível reativar a sala. Tente novamente.');
          this.roomPendingReactivation.set(null);
        },
      });
  }
}
