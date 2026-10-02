import {
  Component,
  DestroyRef,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, finalize, Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { PaginationComponent } from '../../components/pagination/pagination.component';
import {
  StockItem,
  StockStatus,
  UpdateStockItemRequest,
} from '../../models/stock.model';
import { StockService } from '../../services/resources/stock.service';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

@Component({
  selector: 'app-stock',
  standalone: true,
  imports: [PaginationComponent, ReactiveFormsModule],
  templateUrl: './stock.component.html',
  styleUrl: './stock.component.css',
})
export class StockComponent implements OnInit, OnDestroy {
  private readonly stockService = inject(StockService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly searchInput$ = new Subject<string>();

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly items = signal<StockItem[]>([]);

  readonly page = signal(0);
  readonly totalElements = signal(0);
  readonly totalPages = signal(0);
  readonly pageSize = PAGE_SIZE;

  showFilters = false;
  searchTerm = '';
  selectedCategory = '';
  selectedStatus: StockStatus | '' = '';
  expirationFrom = '';
  expirationTo = '';

  readonly editingItem = signal<StockItem | null>(null);
  readonly editSaving = signal(false);
  readonly editError = signal<string | null>(null);

  readonly editForm = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(150)],
    }),
    category: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(50)],
    }),
    quantity: new FormControl<number>(0, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(0)],
    }),
    unit: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(30)],
    }),
    notes: new FormControl('', {
      nonNullable: true,
    }),
  });

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
        this.loadStock();
      });

    this.loadStock();
  }

  ngOnDestroy(): void {
    this.searchInput$.complete();
  }

  loadStock(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.stockService
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
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (result) => {
          this.items.set(result.content);
          this.totalElements.set(result.totalElements);
          this.totalPages.set(result.totalPages);
        },
        error: () => {
          this.errorMessage.set(
            'Não foi possível carregar o estoque. Tente novamente.',
          );
        },
      });
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchInput$.next(input.value);
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  onCategoryChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedCategory = input.value;
    this.page.set(0);
    this.loadStock();
  }

  onStatusChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedStatus = select.value as StockStatus | '';
    this.page.set(0);
    this.loadStock();
  }

  onExpirationFromChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.expirationFrom = input.value;
    this.page.set(0);
    this.loadStock();
  }

  onExpirationToChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.expirationTo = input.value;
    this.page.set(0);
    this.loadStock();
  }

  clearFilters(): void {
    this.selectedCategory = '';
    this.selectedStatus = '';
    this.expirationFrom = '';
    this.expirationTo = '';
    this.page.set(0);
    this.loadStock();
  }

  onPageChange(page: number): void {
    this.page.set(page);
    this.loadStock();
  }

  registerEntry(): void {
    void this.router.navigate(['/stock/entries/new']);
  }

  startEdit(item: StockItem): void {
    this.editingItem.set(item);
    this.editError.set(null);

    this.editForm.setValue({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      notes: item.notes ?? '',
    });
  }

  cancelEdit(): void {
    this.editingItem.set(null);
    this.editError.set(null);
    this.editForm.reset();
  }

  saveEdit(): void {
    const item = this.editingItem();

    if (!item || this.editSaving()) {
      return;
    }

    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    const values = this.editForm.getRawValue();

    const request: UpdateStockItemRequest = {
      name: values.name.trim(),
      category: values.category.trim(),
      quantity: values.quantity,
      unit: values.unit.trim(),
      notes: values.notes.trim() || null,
    };

    this.editSaving.set(true);
    this.editError.set(null);

    this.stockService
      .update(item.id, request)
      .pipe(
        finalize(() => this.editSaving.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.editingItem.set(null);
          this.loadStock();
        },
        error: () => {
          this.editError.set(
            'Não foi possível atualizar o item. Tente novamente.',
          );
        },
      });
  }

  statusLabel(status: StockStatus): string {
    switch (status) {
      case 'Normal':
        return 'Normal';
      case 'Low':
        return 'Baixo';
      case 'OutOfStock':
        return 'Em falta';
    }
  }

  quantityLabel(item: StockItem): string {
    const quantity = new Intl.NumberFormat('pt-BR', {
      maximumFractionDigits: 3,
    }).format(item.quantity);

    return `${quantity} ${item.unit}`;
  }

  expirationLabel(expirationDate: string | null): string {
    if (!expirationDate) {
      return '—';
    }

    const [year, month] = expirationDate.split('-');

    return `${month}/${year}`;
  }
}
