import { DatePipe } from '@angular/common';
import {
  Component,
  DestroyRef,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, finalize } from 'rxjs';

import { PaginationComponent } from '../../components/pagination/pagination.component';
import {
  canManageHealthProcedures,
  healthProcedureName,
  healthProcedureStatusLabel,
  healthProcedureTone,
} from '../../lib/health-procedure';
import {
  HEALTH_PROCEDURE_STATUS_LABELS,
  HEALTH_PROCEDURE_TYPE_LABELS,
  HealthProcedure,
  HealthProcedureStatus,
  HealthProcedureType,
} from '../../models/health-procedure.model';
import { AuthService } from '../../services/resources/auth.service';
import { HealthProcedureService } from '../../services/resources/health-procedure.service';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

function parseCatId(value: string | null): number | null {
  const catId = Number(value);
  return Number.isInteger(catId) && catId > 0 ? catId : null;
}

@Component({
  selector: 'app-health-procedures',
  standalone: true,
  imports: [DatePipe, PaginationComponent],
  templateUrl: './health-procedures.component.html',
  styleUrl: './health-procedures.component.css',
})
export class HealthProceduresComponent implements OnInit, OnDestroy {
  private readonly healthProcedureService = inject(HealthProcedureService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly searchInput$ = new Subject<string>();

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly procedures = signal<HealthProcedure[]>([]);
  readonly page = signal(0);
  readonly totalElements = signal(0);
  readonly totalPages = signal(0);
  readonly selectedType = signal<HealthProcedureType | null>(null);
  readonly selectedStatus = signal<HealthProcedureStatus>('Scheduled');
  readonly catFilterId = signal<number | null>(
    parseCatId(this.route.snapshot.queryParamMap.get('catId')),
  );
  readonly pageSize = PAGE_SIZE;

  readonly canManage = computed(() =>
    canManageHealthProcedures(this.authService.currentUser()?.accessType),
  );

  readonly catFilterName = computed(
    () => this.procedures()[0]?.catName ?? null,
  );

  readonly typeOptions: { value: HealthProcedureType | null; label: string }[] =
    [
      { value: null, label: 'Todos' },
      ...(
        Object.entries(HEALTH_PROCEDURE_TYPE_LABELS) as [
          HealthProcedureType,
          string,
        ][]
      ).map(([value, label]) => ({ value, label })),
    ];

  readonly statusOptions = (
    Object.entries(HEALTH_PROCEDURE_STATUS_LABELS) as [
      HealthProcedureStatus,
      string,
    ][]
  ).map(([value, label]) => ({ value, label: `${label}s` }));

  readonly procedureName = healthProcedureName;
  readonly statusLabel = healthProcedureStatusLabel;
  readonly statusTone = healthProcedureTone;
  readonly typeLabels = HEALTH_PROCEDURE_TYPE_LABELS;

  private searchTerm = '';

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
        this.loadProcedures();
      });

    this.loadProcedures();
  }

  ngOnDestroy(): void {
    this.searchInput$.complete();
  }

  loadProcedures(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.healthProcedureService
      .list({
        search: this.searchTerm || undefined,
        catId: this.catFilterId() ?? undefined,
        type: this.selectedType() ?? undefined,
        status: this.selectedStatus(),
        page: this.page(),
        size: this.pageSize,
      })
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (result) => {
          this.procedures.set(result.content);
          this.totalElements.set(result.totalElements);
          this.totalPages.set(result.totalPages);
        },
        error: () =>
          this.errorMessage.set(
            'Não foi possível carregar os agendamentos. Tente novamente.',
          ),
      });
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchInput$.next(input.value.trim());
  }

  selectType(type: HealthProcedureType | null): void {
    this.selectedType.set(type);
    this.page.set(0);
    this.loadProcedures();
  }

  selectStatus(status: HealthProcedureStatus): void {
    this.selectedStatus.set(status);
    this.page.set(0);
    this.loadProcedures();
  }

  clearCatFilter(): void {
    this.catFilterId.set(null);
    this.page.set(0);
    void this.router.navigate(['/health-procedures']);
    this.loadProcedures();
  }

  onPageChange(page: number): void {
    this.page.set(page);
    this.loadProcedures();
  }

  canEdit(procedure: HealthProcedure): boolean {
    return this.canManage() && procedure.status === 'Scheduled';
  }

  createProcedure(): void {
    const catId = this.catFilterId();
    void this.router.navigate(['/health-procedures/new'], {
      queryParams: catId ? { catId } : {},
    });
  }

  openProcedure(procedure: HealthProcedure): void {
    void this.router.navigate(['/health-procedures', procedure.id]);
  }

  editProcedure(procedure: HealthProcedure): void {
    void this.router.navigate(['/health-procedures', procedure.id, 'edit']);
  }
}
