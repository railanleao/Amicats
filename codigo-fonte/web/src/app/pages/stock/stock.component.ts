import {
  Component,
  computed,
  DestroyRef,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { STOCK_CATEGORIES } from '../../models/stock-category.model';
import { AuthService } from '../../services/resources/auth.service';
import { Router } from '@angular/router';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  EMPTY,
  finalize,
  Subject,
  switchMap,
} from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PaginationComponent } from '../../components/pagination/pagination.component';
import { StockStatusBadgeComponent } from '../../components/stock-status-badge/stock-status-badge.component';
import { formatExpirationDate } from '../../lib/date.utils';
import {
  StockItem,
  StockStatus,
} from '../../models/stock.model';
import { StockService } from '../../services/resources/stock.service';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

@Component({
  selector: 'app-stock',
  standalone: true,
  imports: [PaginationComponent, StockStatusBadgeComponent,
],
  templateUrl: './stock.component.html',
  styleUrl: './stock.component.css',
})
export class StockComponent implements OnInit, OnDestroy {
  private readonly stockService = inject(StockService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly searchInput$ = new Subject<string>();
  private readonly loadStock$ = new Subject<void>();
  readonly stockCategories = STOCK_CATEGORIES;

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly items = signal<StockItem[]>([]);

  readonly page = signal(0);
  readonly totalElements = signal(0);
  readonly totalPages = signal(0);
  readonly pageSize = PAGE_SIZE;
  readonly expirationLabel = formatExpirationDate;

  readonly canManageStock = computed(() => {
    const accessType = this.authService.currentUser()?.accessType;

    return accessType === 'Administrator' || accessType === 'Assistant';
  });

  showFilters = false;
  searchTerm = '';
  selectedCategory = '';
  selectedStatus: StockStatus | '' = '';
  expirationFrom = '';
  expirationTo = '';



  ngOnInit(): void {
    this.loadStock$
      .pipe(
        switchMap(() => {
          this.loading.set(true);
          this.errorMessage.set(null);

          return this.stockService
            .list({
              search: this.searchTerm || undefined,
              category: this.selectedCategory || undefined,
              status: this.selectedStatus || undefined,
              expirationFrom: this.expirationFrom || undefined,
              expirationTo: this.expirationTo || undefined,
              page: this.page(),
              size: this.pageSize,
            })
            .pipe(
              catchError(() => {
                this.errorMessage.set(
                  'Não foi possível carregar o estoque. Tente novamente.',
                );

                return EMPTY;
              }),
              finalize(() => this.loading.set(false)),
            );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((result) => {
        this.items.set(result.content);
        this.totalElements.set(result.totalElements);
        this.totalPages.set(result.totalPages);
      });

    this.searchInput$
      .pipe(
        debounceTime(SEARCH_DEBOUNCE_MS),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((term) => {
        this.searchTerm = term;
        this.resetPageAndLoadStock();
      });

    this.loadStock();
  }

  ngOnDestroy(): void {
    this.searchInput$.complete();
    this.loadStock$.complete();
  }

  loadStock(): void {
    this.loadStock$.next();
  }

  private resetPageAndLoadStock(): void {
    this.page.set(0);
    this.loadStock();
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchInput$.next(input.value);
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

   onCategoryChange(event: Event): void {
     const select = event.target as HTMLSelectElement;
     this.selectedCategory = select.value;
     this.resetPageAndLoadStock();
   }

  onStatusChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedStatus = select.value as StockStatus | '';
    this.resetPageAndLoadStock();
  }

  onExpirationFromChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.expirationFrom = input.value;
    this.resetPageAndLoadStock();
  }

  onExpirationToChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.expirationTo = input.value;
    this.resetPageAndLoadStock();
  }

  clearFilters(): void {
    this.selectedCategory = '';
    this.selectedStatus = '';
    this.expirationFrom = '';
    this.expirationTo = '';
    this.resetPageAndLoadStock();
  }

  onPageChange(page: number): void {
    this.page.set(page);
    this.loadStock();
  }

  registerEntry(): void {
    void this.router.navigate(['/stock/entries/new']);
  }

  editItem(id: number): void {
    void this.router.navigate(['/stock', id, 'edit']);
  }


  quantityLabel(item: StockItem): string {
    const quantity = new Intl.NumberFormat('pt-BR', {
      maximumFractionDigits: 3,
    }).format(item.quantity);

    return `${quantity} ${item.unit}`;
  }
}
