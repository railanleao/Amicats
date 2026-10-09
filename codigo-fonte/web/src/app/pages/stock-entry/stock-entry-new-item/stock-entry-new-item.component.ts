import {
  Component,
  DestroyRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import {
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { TextFieldComponent } from '../../../components/text-field/text-field.component';
import {
  CreateStockItemRequest,
  MEDICATION_CATEGORY,
  StockItem,
} from '../../../models/stock.model';
import { StockService } from '../../../services/resources/stock.service';

@Component({
  selector: 'app-stock-entry-new-item',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TextFieldComponent,
  ],
  templateUrl: './stock-entry-new-item.component.html',
  styleUrl: './stock-entry-new-item.component.css',
})
export class StockEntryNewItemComponent {
  private readonly stockService = inject(StockService);
  private readonly destroyRef = inject(DestroyRef);

  readonly name = input.required<string>();

  readonly created = output<StockItem>();
  readonly cancelled = output<void>();

  readonly creating = signal(false);
  readonly error = signal<string | null>(null);

  readonly medicationCategory = MEDICATION_CATEGORY;

  readonly unitControl = new FormControl('', {
    nonNullable: true,
    validators: [
      Validators.required,
      Validators.maxLength(30),
    ],
  });

  readonly unitErrors = {
    required: 'Informe a unidade.',
    maxlength: 'A unidade deve ter no máximo 30 caracteres.',
  };

  cancel(): void {
    this.cancelled.emit();
  }

  create(): void {
    const name = this.name().trim();
    const unit = this.unitControl.value.trim();

    if (!name || this.creating()) {
      return;
    }

    if (this.unitControl.invalid || !unit) {
      if (!unit) {
        this.unitControl.setErrors({ required: true });
      }

      this.unitControl.markAsTouched();
      return;
    }

    const request: CreateStockItemRequest = {
      name,
      category: MEDICATION_CATEGORY,
      quantity: 0,
      unit,
      notes: null,
    };

    this.creating.set(true);
    this.error.set(null);

    this.stockService
      .create(request)
      .pipe(
        finalize(() => this.creating.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (item) => {
          this.created.emit(item);
        },
        error: () => {
          this.error.set(
            'Não foi possível cadastrar o medicamento. Tente novamente.',
          );
        },
      });
  }
}
