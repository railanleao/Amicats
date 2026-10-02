import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import {
  CreateStockEntryRequest,
  StockItem,
  StockOrigin,
  StockStatus,
} from '../../models/stock.model';
import { StockService } from '../../services/resources/stock.service';

@Component({
  selector: 'app-stock-entry',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './stock-entry.component.html',
  styleUrl: './stock-entry.component.css',
})
export class StockEntryComponent implements OnInit {
  private readonly stockService = inject(StockService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly items = signal<StockItem[]>([]);
  readonly selectedStockItem = signal<StockItem | null>(null);

  readonly loadingItems = signal(false);
  readonly saving = signal(false);

  readonly loadError = signal<string | null>(null);
  readonly saveError = signal<string | null>(null);

  readonly form = new FormGroup({
    stockItemId: new FormControl<number | null>(null, {
      validators: [Validators.required],
    }),
    origin: new FormControl<StockOrigin | ''>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    donorName: new FormControl(
      { value: '', disabled: true },
      {
        nonNullable: true,
        validators: [Validators.maxLength(150)],
      },
    ),
    quantity: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.min(0.001)],
    }),
    entryDate: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    expirationDate: new FormControl('', {
      nonNullable: true,
    }),
  });

  ngOnInit(): void {
    this.loadStockItems();
  }

  loadStockItems(): void {
    this.loadingItems.set(true);
    this.loadError.set(null);

    this.stockService
      .list({
        page: 0,
        size: 1000,
      })
      .pipe(
        finalize(() => this.loadingItems.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (result) => {
          this.items.set(result.content);
        },
        error: () => {
          this.loadError.set(
            'Não foi possível carregar os itens do estoque. Tente novamente.',
          );
        },
      });
  }

  onStockItemChange(): void {
    const stockItemId = this.form.controls.stockItemId.value;

    const item =
      this.items().find((stockItem) => stockItem.id === stockItemId) ?? null;

    this.selectedStockItem.set(item);
  }

  onOriginChange(): void {
    const origin = this.form.controls.origin.value;
    const donorNameControl = this.form.controls.donorName;

    if (origin === 'DONATED') {
      donorNameControl.enable();

      donorNameControl.setValidators([
        Validators.required,
        Validators.maxLength(150),
      ]);
    } else {
      donorNameControl.setValue('');
      donorNameControl.setValidators([Validators.maxLength(150)]);
      donorNameControl.disable();
    }

    donorNameControl.updateValueAndValidity();
  }

  onSubmit(): void {
    if (this.saving()) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const values = this.form.getRawValue();

    const request: CreateStockEntryRequest = {
      stockItemId: values.stockItemId as number,
      origin: values.origin as StockOrigin,
      donorName:
        values.origin === 'DONATED'
          ? values.donorName.trim() || null
          : null,
      quantity: values.quantity as number,
      entryDate: values.entryDate,
      expirationDate: values.expirationDate || null,
    };

    this.saving.set(true);
    this.saveError.set(null);

    this.stockService
      .registerEntry(request)
      .pipe(
        finalize(() => this.saving.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          void this.router.navigate(['/stock']);
        },
        error: () => {
          this.saveError.set(
            'Não foi possível registrar a entrada. Tente novamente.',
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
