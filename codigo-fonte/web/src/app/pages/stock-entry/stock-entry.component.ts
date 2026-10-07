import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { TextFieldComponent } from '../../components/text-field/text-field.component';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  debounceTime,
  distinctUntilChanged,
  finalize,
} from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { formatExpirationDate } from '../../lib/date.utils';

import {
  CreateStockEntryRequest,
  StockItem,
  StockOrigin,
} from '../../models/stock.model';
import { SubmitButtonComponent } from '../../components/submit-button/submit-button.component';
import { StockStatusBadgeComponent } from '../../components/stock-status-badge/stock-status-badge.component';
import { StockService } from '../../services/resources/stock.service';

function todayIsoDate(): string {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

const notFutureDateValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const value = control.value as string;

  if (!value) {
    return null;
  }

  return value > todayIsoDate()
    ? { futureDate: true }
    : null;
};

const expirationNotBeforeEntryValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const entryDate = control.get('entryDate')?.value as string;
  const expirationDate = control.get('expirationDate')?.value as string;

  if (!entryDate || !expirationDate) {
    return null;
  }

  return expirationDate < entryDate
    ? { expirationBeforeEntry: true }
    : null;
};

const STOCK_SEARCH_SIZE = 20;
const STOCK_SEARCH_DEBOUNCE_MS = 300;

@Component({
  selector: 'app-stock-entry',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    SubmitButtonComponent,
    StockStatusBadgeComponent,
    TextFieldComponent,
  ],
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

  readonly stockSearchControl = new FormControl('', {
    nonNullable: true,
  });

  readonly expirationLabel = formatExpirationDate;

  readonly today = todayIsoDate();


  readonly errors = {
    donorName: {
      required: 'Informe o nome do doador.',
      maxlength: 'O nome do doador deve ter no máximo 150 caracteres.',
    },
  };


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
    entryDate: new FormControl(this.today, {
      nonNullable: true,
      validators: [
        Validators.required,
        notFutureDateValidator,
      ],
    }),
    expirationDate: new FormControl('', {
      nonNullable: true,
    }),
    }, {
      validators: [expirationNotBeforeEntryValidator],
    });


ngOnInit(): void {
  this.loadStockItems();

  this.stockSearchControl.valueChanges
    .pipe(
      debounceTime(STOCK_SEARCH_DEBOUNCE_MS),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef),
    )
    .subscribe((searchTerm) => {
      this.loadStockItems(searchTerm);
    });

  this.form.controls.stockItemId.valueChanges
    .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((stockItemId) => {
        const item =
          this.items().find(
            (stockItem) => stockItem.id === stockItemId,
          ) ?? null;

        this.selectedStockItem.set(item);
      });

    this.form.controls.origin.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((origin) => {
        const donorNameControl = this.form.controls.donorName;

        if (origin === 'DONATED') {
          donorNameControl.enable({ emitEvent: false });

          donorNameControl.setValidators([
            Validators.required,
            Validators.maxLength(150),
          ]);
        } else {
          donorNameControl.setValue('', { emitEvent: false });

          donorNameControl.setValidators([
            Validators.maxLength(150),
          ]);

          donorNameControl.disable({ emitEvent: false });
        }

        donorNameControl.updateValueAndValidity({
          emitEvent: false,
        });
      });
  }

  loadStockItems(searchTerm = this.stockSearchControl.value): void {
    this.loadingItems.set(true);
    this.loadError.set(null);

    this.stockService
      .list({
        search: searchTerm.trim() || undefined,
        page: 0,
        size: STOCK_SEARCH_SIZE,
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


  quantityLabel(item: StockItem): string {
    const quantity = new Intl.NumberFormat('pt-BR', {
      maximumFractionDigits: 3,
    }).format(item.quantity);

    return `${quantity} ${item.unit}`;
  }

}
