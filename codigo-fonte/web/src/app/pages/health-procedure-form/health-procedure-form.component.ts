import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  Subject,
  catchError,
  debounceTime,
  finalize,
  map,
  of,
  switchMap,
} from 'rxjs';

import { SubmitButtonComponent } from '../../components/submit-button/submit-button.component';
import { TextFieldComponent } from '../../components/text-field/text-field.component';
import { serverErrorMessage, todayIsoDate } from '../../lib/health-procedure';
import { Cat } from '../../models/cat.model';
import {
  CatHealthSummary,
  HEALTH_PROCEDURE_TYPE_LABELS,
  HealthProcedure,
  HealthProcedureType,
} from '../../models/health-procedure.model';
import { CatService } from '../../services/resources/cat.service';
import { HealthProcedureService } from '../../services/resources/health-procedure.service';

const SEARCH_DEBOUNCE_MS = 300;
const SUGGESTION_LIMIT = 10;
const NAME_MAX_LENGTH = 150;

interface SelectedCat {
  id: number;
  name: string;
}

function nameValidators(type: HealthProcedureType | ''): ValidatorFn[] {
  return type === 'Neutering'
    ? []
    : [Validators.required, Validators.maxLength(NAME_MAX_LENGTH)];
}

@Component({
  selector: 'app-health-procedure-form',
  standalone: true,
  imports: [
    DatePipe,
    ReactiveFormsModule,
    RouterLink,
    SubmitButtonComponent,
    TextFieldComponent,
  ],
  templateUrl: './health-procedure-form.component.html',
  styleUrl: './health-procedure-form.component.css',
})
export class HealthProcedureFormComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly catService = inject(CatService);
  private readonly healthProcedureService = inject(HealthProcedureService);
  private readonly destroyRef = inject(DestroyRef);

  readonly isEdit = this.route.snapshot.data['mode'] === 'edit';
  readonly procedureId = Number(this.route.snapshot.paramMap.get('id'));

  readonly typeOptions = (
    Object.entries(HEALTH_PROCEDURE_TYPE_LABELS) as [
      HealthProcedureType,
      string,
    ][]
  ).map(([value, label]) => ({ value, label }));

  readonly loading = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly saving = signal(false);
  readonly saveError = signal<string | null>(null);

  readonly selectedCat = signal<SelectedCat | null>(null);
  readonly catSuggestions = signal<Cat[]>([]);
  readonly catSuggestionsOpen = signal(false);
  readonly summary = signal<CatHealthSummary | null>(null);
  private readonly catFocused = signal(false);
  private readonly summaryCatId = new Subject<number | null>();
  private originalScheduledDate: string | null = null;

  private readonly notInPast: ValidatorFn = (control) => {
    const value = control.value as string;
    if (!value || value === this.originalScheduledDate || value >= this.today) {
      return null;
    }
    return { pastDate: true };
  };

  readonly form = new FormGroup({
    cat: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    type: new FormControl<HealthProcedureType | ''>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    name: new FormControl('', {
      nonNullable: true,
      validators: nameValidators(''),
    }),
    scheduledDate: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, this.notInPast],
    }),
    notes: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(1000)],
    }),
  });

  readonly errors = {
    name: {
      required: 'Informe o nome da vacina ou do vermífugo.',
      maxlength: 'O nome deve ter no máximo 150 caracteres.',
    },
  };

  constructor() {
    this.listenToTypeChanges();
    this.listenToSummary();

    if (this.isEdit) {
      this.loadProcedure();
      return;
    }

    this.listenToCatSearch();
    this.preselectCatFromQuery();
  }

  get today(): string {
    return todayIsoDate();
  }

  get requiresName(): boolean {
    return this.form.controls.type.value !== 'Neutering';
  }

  get neuteringLabel(): string {
    const current = this.summary();
    switch (current?.neuteringStatus) {
      case 'Neutered':
        return 'Castrado(a)';
      case 'Scheduled':
        return 'Agendada';
      case 'NotNeutered':
        return 'Não castrado(a)';
      default:
        return '—';
    }
  }

  isInvalid(control: AbstractControl): boolean {
    return control.invalid && control.touched;
  }

  get catNotSelected(): boolean {
    return this.form.controls.cat.touched && this.selectedCat() === null;
  }

  onCatFocus(): void {
    this.catFocused.set(true);
    this.catSuggestionsOpen.set(this.catSuggestions().length > 0);
  }

  onCatBlur(): void {
    this.catFocused.set(false);
    this.catSuggestionsOpen.set(false);
  }

  onSelectCat(cat: SelectedCat): void {
    this.selectedCat.set({ id: cat.id, name: cat.name });
    this.form.controls.cat.setValue(cat.name, { emitEvent: false });
    this.catSuggestionsOpen.set(false);
    this.loadSummary(cat.id);
  }

  onSubmit(): void {
    if (this.saving()) {
      return;
    }

    this.saveError.set(null);
    const cat = this.selectedCat();

    if (this.form.invalid || !cat) {
      this.form.markAllAsTouched();
      return;
    }

    const values = this.form.getRawValue();
    const name = this.requiresName ? values.name.trim() : null;
    const notes = values.notes.trim() || null;

    const request$ = this.isEdit
      ? this.healthProcedureService.update(this.procedureId, {
          name,
          scheduledDate: values.scheduledDate,
          notes,
        })
      : this.healthProcedureService.create({
          catId: cat.id,
          type: values.type as HealthProcedureType,
          name,
          scheduledDate: values.scheduledDate,
          notes,
        });

    this.saving.set(true);

    request$
      .pipe(
        finalize(() => this.saving.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (saved) =>
          void this.router.navigate(['/health-procedures', saved.id]),
        error: (error: HttpErrorResponse) => this.handleSaveError(error),
      });
  }

  private listenToTypeChanges(): void {
    const nameControl = this.form.controls.name;

    this.form.controls.type.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((type) => {
        nameControl.setValidators(nameValidators(type));
        if (type === 'Neutering') {
          nameControl.setValue('');
        }
        nameControl.updateValueAndValidity();
      });
  }

  private listenToCatSearch(): void {
    const catControl = this.form.controls.cat;

    catControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        if (this.selectedCat()?.name !== value) {
          this.selectedCat.set(null);
          this.summaryCatId.next(null);
        }
      });

    catControl.valueChanges
      .pipe(
        map((value) => value.trim()),
        debounceTime(SEARCH_DEBOUNCE_MS),
        switchMap((term) =>
          term
            ? this.catService
                .list({ search: term, page: 0, size: SUGGESTION_LIMIT })
                .pipe(
                  map((page) => page.content),
                  catchError(() => of<Cat[]>([])),
                )
            : of<Cat[]>([]),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((cats) => {
        this.catSuggestions.set(cats);
        this.catSuggestionsOpen.set(this.catFocused() && cats.length > 0);
      });
  }

  private preselectCatFromQuery(): void {
    const catId = Number(this.route.snapshot.queryParamMap.get('catId'));
    if (!Number.isInteger(catId) || catId <= 0) {
      return;
    }

    this.catService
      .findById(catId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (cat) => this.onSelectCat(cat),
        error: () => this.selectedCat.set(null),
      });
  }

  private loadProcedure(): void {
    if (!Number.isInteger(this.procedureId)) {
      this.loadError.set('Agendamento não encontrado.');
      return;
    }

    this.loading.set(true);

    this.healthProcedureService
      .findById(this.procedureId)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (procedure) => this.fillForm(procedure),
        error: (error: HttpErrorResponse) =>
          this.loadError.set(
            error.status === 404
              ? 'Agendamento não encontrado.'
              : 'Não foi possível carregar o agendamento. Tente novamente.',
          ),
      });
  }

  private fillForm(procedure: HealthProcedure): void {
    if (procedure.status !== 'Scheduled') {
      this.loadError.set(
        'Só é possível editar agendamentos que ainda não foram realizados nem cancelados.',
      );
      return;
    }

    this.originalScheduledDate = procedure.scheduledDate;
    this.form.patchValue({
      cat: procedure.catName,
      type: procedure.type,
      name: procedure.name ?? '',
      scheduledDate: procedure.scheduledDate,
      notes: procedure.notes ?? '',
    });
    this.form.controls.cat.disable();
    this.form.controls.type.disable();
    this.selectedCat.set({ id: procedure.catId, name: procedure.catName });
    this.loadSummary(procedure.catId);
  }

  private loadSummary(catId: number): void {
    this.summaryCatId.next(catId);
  }

  private listenToSummary(): void {
    this.summaryCatId
      .pipe(
        switchMap((catId) => {
          this.summary.set(null);
          return catId === null
            ? of(null)
            : this.healthProcedureService
                .summarize(catId)
                .pipe(catchError(() => of(null)));
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((summary) => this.summary.set(summary));
  }

  private handleSaveError(error: HttpErrorResponse): void {
    switch (error.status) {
      case 400:
        this.saveError.set(
          serverErrorMessage(
            error,
            'Confira os dados informados e tente novamente.',
          ),
        );
        break;
      case 409:
        this.saveError.set(
          serverErrorMessage(
            error,
            'Esse gatinho já está castrado ou já tem uma castração agendada.',
          ),
        );
        break;
      case 403:
        this.saveError.set(
          'Seu perfil não tem permissão para agendar procedimentos de saúde.',
        );
        break;
      case 404:
        this.saveError.set('O gatinho ou o agendamento não foi encontrado.');
        break;
      default:
        this.saveError.set(
          'Não foi possível salvar o agendamento. Tente novamente.',
        );
    }
  }
}
