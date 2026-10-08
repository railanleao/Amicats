import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  catchError,
  debounceTime,
  finalize,
  map,
  Observable,
  of,
  switchMap,
} from 'rxjs';

import { SubmitButtonComponent } from '../../components/submit-button/submit-button.component';
import { TextFieldComponent } from '../../components/text-field/text-field.component';
import { ToggleComponent } from '../../components/toggle/toggle.component';
import { formatAge } from '../../lib/cat-age';
import { felvResult, fivResult, isNeutered } from '../../lib/cat-health';
import {
  AGE_GROUP_LABELS,
  Cat,
  HEALTH_STATUS_LABELS,
  SEX_LABELS,
} from '../../models/cat.model';
import {
  ADMINISTRATION_ROUTE_LABELS,
  AdministrationRoute,
  CreateInternalMedicalPrescriptionRequest,
  CreatePrescribedMedicationRequest,
  PrescribedMedication,
} from '../../models/medical-prescription.model';
import { MEDICATION_CATEGORY, StockItem } from '../../models/stock.model';
import { CatService } from '../../services/resources/cat.service';
import { InternalMedicalPrescriptionService } from '../../services/resources/internal-medical-prescription.service';
import { PrescribedMedicationService } from '../../services/resources/prescribed-medication.service';
import { StockService } from '../../services/resources/stock.service';

const SEARCH_DEBOUNCE_MS = 300;
const SUGGESTION_LIMIT = 10;

interface MedicationSearchResult {
  term: string | null;
  items: StockItem[];
}

function normalizeMedicationName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

@Component({
  selector: 'app-internal-prescription-form',
  standalone: true,
  imports: [
    DatePipe,
    ReactiveFormsModule,
    RouterLink,
    SubmitButtonComponent,
    TextFieldComponent,
    ToggleComponent,
  ],
  templateUrl: './internal-prescription-form.component.html',
  styleUrl: './internal-prescription-form.component.css',
})
export class InternalPrescriptionFormComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly catService = inject(CatService);
  private readonly stockService = inject(StockService);
  private readonly prescriptionService = inject(
    InternalMedicalPrescriptionService,
  );
  private readonly prescribedMedicationService = inject(
    PrescribedMedicationService,
  );
  private readonly destroyRef = inject(DestroyRef);

  readonly catId = Number(this.route.snapshot.paramMap.get('id'));

  readonly routeOptions = (
    Object.keys(ADMINISTRATION_ROUTE_LABELS) as AdministrationRoute[]
  ).map((value) => ({
    value,
    label: ADMINISTRATION_ROUTE_LABELS[value],
  }));

  readonly cat = signal<Cat | null>(null);
  readonly loading = signal(false);
  readonly loadError = signal<string | null>(null);

  readonly activeMedications = signal<PrescribedMedication[]>([]);
  readonly activeMedicationsError = signal<string | null>(null);

  readonly prescribeMedication = signal(true);
  readonly selectedMedication = signal<StockItem | null>(null);
  readonly suggestions = signal<StockItem[]>([]);
  readonly suggestionsOpen = signal(false);
  readonly searchedTerm = signal<string | null>(null);
  private readonly medicationFocused = signal(false);

  readonly saving = signal(false);
  readonly saveError = signal<string | null>(null);

  readonly form = new FormGroup({
    title: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(200)],
    }),
    notes: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(2000)],
    }),
    medication: new FormGroup({
      name: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.maxLength(150)],
      }),
      unit: new FormControl('', {
        nonNullable: true,
        validators: [Validators.maxLength(30)],
      }),
      dosage: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.maxLength(50)],
      }),
      route: new FormControl<AdministrationRoute | ''>('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      intervalHours: new FormControl<number | null>(null, {
        validators: [
          Validators.required,
          Validators.min(1),
          Validators.max(720),
        ],
      }),
      durationDays: new FormControl<number | null>(null, {
        validators: [
          Validators.required,
          Validators.min(1),
          Validators.max(365),
        ],
      }),
    }),
  });

  readonly errors = {
    title: {
      required: 'Informe o diagnóstico ou título do atendimento.',
      maxlength: 'O título deve ter no máximo 200 caracteres.',
    },
    dosage: {
      required: 'Informe a dosagem.',
      maxlength: 'A dosagem deve ter no máximo 50 caracteres.',
    },
    unit: { maxlength: 'A unidade deve ter no máximo 30 caracteres.' },
  };

  constructor() {
    if (!Number.isInteger(this.catId)) {
      this.loadError.set('Gatinho não encontrado.');
      return;
    }

    this.loadCat();
    this.loadActiveMedications();
    this.listenToMedicationSearch();
  }

  get medicationControls() {
    return this.form.controls.medication.controls;
  }

  get isNewMedication(): boolean {
    const name = this.medicationControls.name.value.trim();
    return (
      this.prescribeMedication() &&
      this.selectedMedication() === null &&
      name.length > 0 &&
      this.searchedTerm() === name
    );
  }

  get catSummary(): string {
    const cat = this.cat();
    if (!cat) {
      return '';
    }
    return [
      cat.sex ? SEX_LABELS[cat.sex] : null,
      this.ageLabel(cat),
      cat.roomTitle,
    ]
      .filter((part): part is string => !!part)
      .join(' · ');
  }

  get healthTag(): string | null {
    const status = this.cat()?.healthStatus;
    const positive =
      fivResult(status) === 'positive' || felvResult(status) === 'positive';
    return status && positive ? HEALTH_STATUS_LABELS[status] : null;
  }

  get neuteredTag(): string | null {
    const cat = this.cat();
    if (!cat || !isNeutered(cat.neuteringStatus)) {
      return null;
    }
    return cat.sex === 'Male' ? 'Castrado' : 'Castrada';
  }

  isInvalid(control: AbstractControl): boolean {
    return control.invalid && control.touched;
  }

  onToggleMedication(): void {
    const enabled = !this.prescribeMedication();
    this.prescribeMedication.set(enabled);

    if (enabled) {
      this.form.controls.medication.enable();
    } else {
      this.form.controls.medication.disable();
      this.suggestionsOpen.set(false);
    }
  }

  onMedicationFocus(): void {
    this.medicationFocused.set(true);
    this.suggestionsOpen.set(this.suggestions().length > 0);
  }

  onMedicationBlur(): void {
    this.medicationFocused.set(false);
    this.suggestionsOpen.set(false);
  }

  onSelectMedication(item: StockItem): void {
    this.selectedMedication.set(item);
    this.medicationControls.name.setValue(item.name, { emitEvent: false });
    this.medicationControls.unit.setValue('');
    this.suggestionsOpen.set(false);
  }

  onSubmit(): void {
    if (this.saving()) {
      return;
    }

    this.saveError.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const values = this.form.getRawValue();
    const request: CreateInternalMedicalPrescriptionRequest = {
      title: values.title.trim(),
      notes: values.notes.trim() || null,
      medication: this.prescribeMedication()
        ? this.buildMedicationRequest()
        : null,
    };

    this.saving.set(true);

    this.prescriptionService
      .create(this.catId, request)
      .pipe(
        finalize(() => this.saving.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (created) =>
          void this.router.navigate(['/medical-records', this.catId], {
            state: {
              prescriptionCreated: true,
              stockWarning: created.medication?.stockWarning ?? null,
            },
          }),
        error: (error: HttpErrorResponse) => this.handleSaveError(error),
      });
  }

  private buildMedicationRequest(): CreatePrescribedMedicationRequest {
    const values = this.form.controls.medication.getRawValue();
    const selected = this.selectedMedication();

    return {
      medicationId: selected?.id ?? null,
      newMedicationName: selected ? null : values.name.trim(),
      newMedicationUnit: selected ? null : values.unit.trim() || null,
      dosage: values.dosage.trim(),
      route: values.route as AdministrationRoute,
      intervalHours: values.intervalHours as number,
      durationDays: values.durationDays as number,
    };
  }

  private listenToMedicationSearch(): void {
    const nameControl = this.medicationControls.name;

    nameControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        if (this.selectedMedication()?.name !== value) {
          this.selectedMedication.set(null);
        }
      });

    nameControl.valueChanges
      .pipe(
        map((value) => value.trim()),
        debounceTime(SEARCH_DEBOUNCE_MS),
        switchMap((term) => this.searchMedications(term)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(({ term, items }) => {
        this.suggestions.set(items);
        this.searchedTerm.set(term);

        const exactMatch = term
          ? items.find(
              (item) =>
                normalizeMedicationName(item.name) ===
                normalizeMedicationName(term),
            )
          : undefined;

        if (exactMatch && nameControl.value.trim() === term) {
          this.onSelectMedication(exactMatch);
          return;
        }

        this.suggestionsOpen.set(this.medicationFocused() && items.length > 0);
      });
  }

  private searchMedications(term: string): Observable<MedicationSearchResult> {
    if (!term) {
      return of({ term, items: [] });
    }

    return this.stockService
      .list({
        category: MEDICATION_CATEGORY,
        search: term,
        page: 0,
        size: SUGGESTION_LIMIT,
      })
      .pipe(
        map((page): MedicationSearchResult => ({ term, items: page.content })),
        catchError(() => of<MedicationSearchResult>({ term: null, items: [] })),
      );
  }

  private loadCat(): void {
    this.loading.set(true);

    this.catService
      .findById(this.catId)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (cat) => this.cat.set(cat),
        error: (error: HttpErrorResponse) =>
          this.loadError.set(
            error.status === 404
              ? 'Gatinho não encontrado.'
              : 'Não foi possível carregar o gatinho. Tente novamente.',
          ),
      });
  }

  private loadActiveMedications(): void {
    this.prescribedMedicationService
      .listActive(this.catId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (medications) => this.activeMedications.set(medications),
        error: () =>
          this.activeMedicationsError.set(
            'Não foi possível carregar a medicação ativa.',
          ),
      });
  }

  private ageLabel(cat: Cat): string | null {
    return (
      formatAge(cat.estimatedBirthDate) ??
      (cat.ageGroup ? AGE_GROUP_LABELS[cat.ageGroup] : null)
    );
  }

  private handleSaveError(error: HttpErrorResponse): void {
    if (error.status === 409) {
      this.saveError.set(
        'Esse gatinho já está tomando esse medicamento. Cancele a medicação atual antes de prescrever novamente.',
      );
    } else if (error.status === 403) {
      this.saveError.set(
        'Apenas veterinários com CRMV cadastrado podem registrar atendimentos internos.',
      );
    } else if (error.status === 404) {
      this.saveError.set('O gatinho ou o medicamento não foi encontrado.');
    } else if (error.status === 400) {
      this.saveError.set('Confira os dados informados e tente novamente.');
    } else {
      this.saveError.set(
        'Não foi possível salvar o atendimento. Tente novamente.',
      );
    }
  }
}
