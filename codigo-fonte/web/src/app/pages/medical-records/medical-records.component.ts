import { Component, DestroyRef, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, finalize } from 'rxjs';

import { PaginationComponent } from '../../components/pagination/pagination.component';
import { CatAvatarComponent } from '../../components/cat-avatar/cat-avatar.component';
import {
  AGE_GROUP_LABELS,
  Cat,
  GENERAL_STATUS_LABELS,
  GeneralStatus,
  HEALTH_STATUS_LABELS,
  PIF_RESULT_LABELS,
} from '../../models/cat.model';
import { Room } from '../../models/room.model';
import { CatService } from '../../services/resources/cat.service';
import { RoomService } from '../../services/resources/room.service';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

@Component({
  selector: 'app-medical-records',
  standalone: true,
  imports: [PaginationComponent, CatAvatarComponent],
  templateUrl: './medical-records.component.html',
  styleUrl: './medical-records.component.css',
})
export class MedicalRecordsComponent implements OnInit, OnDestroy {
  private readonly catService = inject(CatService);
  private readonly roomService = inject(RoomService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly searchInput$ = new Subject<string>();

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly cats = signal<Cat[]>([]);
  readonly rooms = signal<Room[]>([]);
  readonly page = signal(0);
  readonly totalElements = signal(0);
  readonly totalPages = signal(0);
  readonly pageSize = PAGE_SIZE;

  showFilters = false;
  searchTerm = '';
  selectedRoomId = '';
  selectedGeneralStatus = '';

  readonly generalStatusOptions = Object.entries(GENERAL_STATUS_LABELS) as [GeneralStatus, string][];

  ngOnInit(): void {
    this.searchInput$
      .pipe(debounceTime(SEARCH_DEBOUNCE_MS), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((term) => {
        this.searchTerm = term;
        this.page.set(0);
        this.loadCats();
      });

    this.loadRooms();
    this.loadCats();
  }

  ngOnDestroy(): void {
    this.searchInput$.complete();
  }

  private loadRooms(): void {
    this.roomService
      .list({ page: 0, size: 100 })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => this.rooms.set(result.content),
        error: () => this.rooms.set([]),
      });
  }

  loadCats(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.catService
      .list({
        search: this.searchTerm || undefined,
        roomId: this.selectedRoomId ? Number(this.selectedRoomId) : undefined,
        generalStatus: (this.selectedGeneralStatus as GeneralStatus) || undefined,
        page: this.page(),
        size: this.pageSize,
      })
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (result) => {
          this.cats.set(result.content);
          this.totalElements.set(result.totalElements);
          this.totalPages.set(result.totalPages);
        },
        error: () =>
          this.errorMessage.set('Não foi possível carregar os prontuários. Tente novamente.'),
      });
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchInput$.next(input.value);
  }

  onRoomChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedRoomId = select.value;
    this.page.set(0);
    this.loadCats();
  }

  onStatusChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedGeneralStatus = select.value;
    this.page.set(0);
    this.loadCats();
  }

  onPageChange(page: number): void {
    this.page.set(page);
    this.loadCats();
  }

  ageGroupLabel(cat: Cat): string {
    return cat.ageGroup ? AGE_GROUP_LABELS[cat.ageGroup] : '—';
  }

  generalStatusLabel(cat: Cat): string {
    return GENERAL_STATUS_LABELS[cat.generalStatus];
  }

  healthStatusLabel(cat: Cat): string {
    return HEALTH_STATUS_LABELS[cat.healthStatus];
  }

  pifResultLabel(cat: Cat): string {
    return PIF_RESULT_LABELS[cat.pifResult];
  }

  openRecord(cat: Cat): void {
    void this.router.navigate(['/medical-records', cat.id]);
  }
}
