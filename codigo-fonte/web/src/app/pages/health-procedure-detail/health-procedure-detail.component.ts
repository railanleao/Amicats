import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable, finalize } from 'rxjs';

import { SubmitButtonComponent } from '../../components/submit-button/submit-button.component';
import {
  addMonthsToIsoDate,
  asUtc,
  canManageHealthProcedures,
  formatIsoDate,
  healthProcedureName,
  healthProcedureStatusLabel,
  healthProcedureTone,
  toIsoDate,
} from '../../lib/health-procedure';
import {
  HEALTH_PROCEDURE_ACTION_LABELS,
  HEALTH_PROCEDURE_FIELD_LABELS,
  HEALTH_PROCEDURE_TYPE_LABELS,
  HealthProcedure,
  HealthProcedureChange,
  HealthProcedureField,
} from '../../models/health-procedure.model';
import { AuthService } from '../../services/resources/auth.service';
import { HealthProcedureService } from '../../services/resources/health-procedure.service';

type ActionPanel = 'complete' | 'cancel';
type BoosterOption = 'threeMonths' | 'oneYear' | 'custom';

const BOOSTER_MONTHS: Record<Exclude<BoosterOption, 'custom'>, number> = {
  threeMonths: 3,
  oneYear: 12,
};

const DATE_FIELDS = new Set<HealthProcedureField>([
  'ScheduledDate',
  'CompletedDate',
]);

@Component({
  selector: 'app-health-procedure-detail',
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule, RouterLink, SubmitButtonComponent],
  templateUrl: './health-procedure-detail.component.html',
  styleUrl: './health-procedure-detail.component.css',
})
export class HealthProcedureDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly healthProcedureService = inject(HealthProcedureService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  readonly procedureId = Number(this.route.snapshot.paramMap.get('id'));
  readonly today = toIsoDate(new Date());
  readonly typeLabels = HEALTH_PROCEDURE_TYPE_LABELS;
  readonly actionLabels = HEALTH_PROCEDURE_ACTION_LABELS;
  readonly procedureName = healthProcedureName;
  readonly statusLabel = healthProcedureStatusLabel;
  readonly statusTone = healthProcedureTone;

  readonly boosterOptions: { value: BoosterOption; label: string }[] = [
    { value: 'threeMonths', label: 'Em 3 meses' },
    { value: 'oneYear', label: 'Em 1 ano' },
    { value: 'custom', label: 'Outra data' },
  ];

  readonly procedure = signal<HealthProcedure | null>(null);
  readonly changes = signal<HealthProcedureChange[]>([]);
  readonly loading = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly changesError = signal<string | null>(null);
  readonly openPanel = signal<ActionPanel | null>(null);
  readonly saving = signal(false);
  readonly actionError = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  readonly canChange = computed(
    () =>
      canManageHealthProcedures(this.authService.currentUser()?.accessType) &&
      this.procedure()?.status === 'Scheduled',
  );

  readonly completeForm = new FormGroup({
    completedDate: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    notes: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(1000)],
    }),
    scheduleBooster: new FormControl(false, { nonNullable: true }),
    boosterOption: new FormControl<BoosterOption>('oneYear', {
      nonNullable: true,
    }),
    boosterDate: new FormControl('', { nonNullable: true }),
  });

  readonly cancelForm = new FormGroup({
    reason: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(500)],
    }),
  });

  constructor() {
    if (!Number.isInteger(this.procedureId)) {
      this.loadError.set('Agendamento não encontrado.');
      return;
    }

    this.loadProcedure();
    this.loadChanges();
  }

  get isVaccine(): boolean {
    return this.procedure()?.type === 'Vaccine';
  }

  get boosterDate(): string | null {
    const values = this.completeForm.getRawValue();
    if (!this.isVaccine || !values.scheduleBooster || !values.completedDate) {
      return null;
    }
    if (values.boosterOption === 'custom') {
      return values.boosterDate || null;
    }
    return addMonthsToIsoDate(
      values.completedDate,
      BOOSTER_MONTHS[values.boosterOption],
    );
  }

  get boosterMissing(): boolean {
    const values = this.completeForm.getRawValue();
    return (
      this.isVaccine &&
      values.scheduleBooster &&
      values.boosterOption === 'custom' &&
      !values.boosterDate
    );
  }

  isInvalid(control: AbstractControl): boolean {
    return control.invalid && control.touched;
  }

  editProcedure(): void {
    void this.router.navigate(['/health-procedures', this.procedureId, 'edit']);
  }

  openCompletePanel(): void {
    this.completeForm.reset({
      completedDate: this.today,
      notes: this.procedure()?.notes ?? '',
      scheduleBooster: false,
      boosterOption: 'oneYear',
      boosterDate: '',
    });
    this.actionError.set(null);
    this.successMessage.set(null);
    this.openPanel.set('complete');
  }

  openCancelPanel(): void {
    this.cancelForm.reset();
    this.actionError.set(null);
    this.successMessage.set(null);
    this.openPanel.set('cancel');
  }

  closePanel(): void {
    this.openPanel.set(null);
    this.actionError.set(null);
  }

  confirmComplete(): void {
    if (this.saving()) {
      return;
    }
    if (this.completeForm.invalid || this.boosterMissing) {
      this.completeForm.markAllAsTouched();
      return;
    }

    const values = this.completeForm.getRawValue();
    const boosterDate = this.boosterDate;

    this.runAction(
      this.healthProcedureService.complete(this.procedureId, {
        completedDate: values.completedDate,
        notes: values.notes.trim() || null,
        boosterDate,
      }),
      boosterDate
        ? `Agendamento marcado como realizado. Reforço agendado para ${formatIsoDate(boosterDate)}.`
        : 'Agendamento marcado como realizado.',
      'Confira as datas: a realização não pode ser no futuro e o reforço precisa ser depois dela.',
    );
  }

  confirmCancel(): void {
    if (this.saving()) {
      return;
    }
    if (this.cancelForm.invalid) {
      this.cancelForm.markAllAsTouched();
      return;
    }

    this.runAction(
      this.healthProcedureService.cancel(this.procedureId, {
        reason: this.cancelForm.getRawValue().reason.trim(),
      }),
      'Agendamento cancelado.',
      'Informe o motivo do cancelamento.',
    );
  }

  changeDescription(change: HealthProcedureChange): string | null {
    if (!change.field) {
      return null;
    }

    const label = HEALTH_PROCEDURE_FIELD_LABELS[change.field];
    const newValue = this.formatChangeValue(change.field, change.newValue);

    if (change.oldValue === null) {
      return `${label}: ${newValue}`;
    }
    const oldValue = this.formatChangeValue(change.field, change.oldValue);
    return `${label}: ${oldValue} → ${newValue}`;
  }

  changedAt(change: HealthProcedureChange): string {
    return asUtc(change.changedAt);
  }

  private runAction(
    request$: Observable<HealthProcedure>,
    successMessage: string,
    badRequestMessage: string,
  ): void {
    this.saving.set(true);
    this.actionError.set(null);

    request$
      .pipe(
        finalize(() => this.saving.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (updated) => {
          this.procedure.set(updated);
          this.openPanel.set(null);
          this.successMessage.set(successMessage);
          this.loadChanges();
        },
        error: (error: HttpErrorResponse) =>
          this.actionError.set(
            this.actionErrorMessage(error, badRequestMessage),
          ),
      });
  }

  private formatChangeValue(
    field: HealthProcedureField,
    value: string | null,
  ): string {
    if (value === null) {
      return '—';
    }
    return DATE_FIELDS.has(field) ? formatIsoDate(value) : value;
  }

  private loadProcedure(): void {
    this.loading.set(true);

    this.healthProcedureService
      .findById(this.procedureId)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (procedure) => this.procedure.set(procedure),
        error: (error: HttpErrorResponse) =>
          this.loadError.set(
            error.status === 404
              ? 'Agendamento não encontrado.'
              : 'Não foi possível carregar o agendamento. Tente novamente.',
          ),
      });
  }

  private loadChanges(): void {
    this.changesError.set(null);

    this.healthProcedureService
      .listChanges(this.procedureId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (changes) => this.changes.set(changes),
        error: () =>
          this.changesError.set('Não foi possível carregar o histórico.'),
      });
  }

  private actionErrorMessage(
    error: HttpErrorResponse,
    badRequestMessage: string,
  ): string {
    switch (error.status) {
      case 400:
        return badRequestMessage;
      case 403:
        return 'Seu perfil não tem permissão para alterar agendamentos de saúde.';
      case 404:
        return 'Agendamento não encontrado.';
      default:
        return 'Não foi possível salvar. Tente novamente.';
    }
  }
}
