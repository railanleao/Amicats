import { Component, DestroyRef, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

import { TextFieldComponent } from '../../components/text-field/text-field.component';
import { SubmitButtonComponent } from '../../components/submit-button/submit-button.component';
import { STOCK_CATEGORIES } from '../../models/stock-category.model';
import {
  StockItem,
  UpdateStockItemRequest,
} from '../../models/stock.model';
import { StockService } from '../../services/resources/stock.service';

@Component({
  selector: 'app-stock-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    SubmitButtonComponent,
    TextFieldComponent,
  ],
  templateUrl: './stock-form.component.html',
  styleUrl: './stock-form.component.css',
})
export class StockFormComponent {
  private readonly stockService = inject(StockService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly stockCategories = STOCK_CATEGORIES;

  readonly loading = signal(false);
  readonly saving = signal(false);

  readonly loadError = signal<string | null>(null);
  readonly saveError = signal<string | null>(null);

  readonly item = signal<StockItem | null>(null);

  readonly errors = {
    name: {
      required: 'Informe o nome do medicamento.',
      maxlength: 'O nome deve ter no máximo 150 caracteres.',
    },
    unit: {
      required: 'Informe a unidade.',
      maxlength: 'A unidade deve ter no máximo 30 caracteres.',
    },
  };

  readonly form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.maxLength(150),
      ],
    }),

    category: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.maxLength(50),
      ],
    }),

    unit: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.maxLength(30),
      ],
    }),

    notes: new FormControl('', {
      nonNullable: true,
    }),
  });

  constructor() {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = Number(idParam);

    if (!idParam || !Number.isInteger(id) || id <= 0) {
      this.loadError.set('Item de estoque inválido.');
      return;
    }

    this.loadItem(id);
  }

  private loadItem(id: number): void {
    this.loading.set(true);
    this.loadError.set(null);

    this.stockService
      .findById(id)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (item) => {
          this.item.set(item);

          this.form.setValue({
            name: item.name,
            category: item.category,
            unit: item.unit,
            notes: item.notes ?? '',
          });
        },
        error: () => {
          this.loadError.set(
            'Não foi possível carregar o item do estoque. Tente novamente.',
          );
        },
      });
  }

  save(): void {
    const item = this.item();

    if (!item || this.saving()) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const values = this.form.getRawValue();

    const request: UpdateStockItemRequest = {
      name: values.name.trim(),
      category: values.category.trim(),
      quantity: item.quantity,
      unit: values.unit.trim(),
      notes: values.notes.trim() || null,
    };

    this.saving.set(true);
    this.saveError.set(null);

    this.stockService
      .update(item.id, request)
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
            'Não foi possível salvar as alterações. Tente novamente.',
          );
        },
      });
  }
}
