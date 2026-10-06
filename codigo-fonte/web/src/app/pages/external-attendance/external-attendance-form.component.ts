import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, finalize, of } from 'rxjs';

import { SubmitButtonComponent } from '../../components/submit-button/submit-button.component';
import { TextFieldComponent } from '../../components/text-field/text-field.component';
import {
  AGE_GROUP_LABELS,
  Cat,
  GENERAL_STATUS_LABELS,
  HEALTH_STATUS_LABELS,
  SEX_LABELS,
} from '../../models/cat.model';
import { ExternalAttendanceService } from '../../services/resources/external-attendance.service';
import { CatService } from '../../services/resources/cat.service';

@Component({
  selector: 'app-external-attendance-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    SubmitButtonComponent,
    TextFieldComponent,
  ],
  templateUrl: './external-attendance-form.component.html',
  styleUrl: './external-attendance-form.component.css',
})
export class ExternalAttendanceFormComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly catService = inject(CatService);
  private readonly externalAttendanceService = inject(
    ExternalAttendanceService,
  );
  private readonly destroyRef = inject(DestroyRef);

  readonly cats = signal<Cat[]>([]);
  readonly partnerClinics = signal<string[]>([]);
  readonly loadingCats = signal(false);
  readonly loadingClinics = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly clinicLoadMessage = signal<string | null>(null);
  readonly saving = signal(false);
  readonly saveError = signal<string | null>(null);
  readonly selectedFileName = signal<string | null>(null);

  readonly form = new FormGroup({
    catId: new FormControl<number | null>(null, {
      validators: [Validators.required],
    }),
    partnerClinic: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(150)],
    }),
    veterinarian: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(150)],
    }),
    crmv: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(30)],
    }),
    attendanceDate: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    diagnosis: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(2000)],
    }),
  });

  readonly errors = {
    partnerClinic: {
      required: 'Selecione a clínica parceira.',
      maxlength: 'O nome da clínica deve ter no máximo 150 caracteres.',
    },
    veterinarian: {
      required: 'Informe o veterinário responsável.',
      maxlength: 'O nome deve ter no máximo 150 caracteres.',
    },
    crmv: {
      required: 'Informe o CRMV / UF.',
      maxlength: 'O CRMV deve ter no máximo 30 caracteres.',
    },
    attendanceDate: {
      required: 'Informe a data do atendimento.',
    },
    diagnosis: {
      required: 'Informe o diagnóstico ou as observações.',
      maxlength: 'O diagnóstico deve ter no máximo 2000 caracteres.',
    },
  };

  constructor() {
    const catId = Number(this.route.snapshot.queryParamMap.get('catId'));
    if (Number.isInteger(catId) && catId > 0) {
      this.form.controls.catId.setValue(catId);
    }
  }

  ngOnInit(): void {
    this.loadCats();
    this.loadClinics();
  }

  get selectedCat(): Cat | null {
    const catId = this.form.controls.catId.value;
    return this.cats().find((cat) => cat.id === catId) ?? null;
  }

  get selectedCatDetails(): string {
    const cat = this.selectedCat;
    if (!cat) {
      return 'Selecione um gato para visualizar as informações.';
    }

    return [
      cat.sex ? SEX_LABELS[cat.sex] : null,
      cat.ageGroup ? AGE_GROUP_LABELS[cat.ageGroup] : null,
      cat.healthStatus ? HEALTH_STATUS_LABELS[cat.healthStatus] : null,
    ]
      .filter((part): part is string => !!part)
      .join(' · ');
  }

  get selectedCatStatus(): string {
    const cat = this.selectedCat;
    return cat
      ? GENERAL_STATUS_LABELS[cat.generalStatus]
      : 'Nenhum gato selecionado';
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.selectedFileName.set(file?.name ?? null);
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
    const fileName = this.selectedFileName();

    if (!fileName) {
      this.saveError.set('Selecione o arquivo do atendimento recebido.');
      return;
    }

    this.saving.set(true);

    this.externalAttendanceService
      .create({
        catId: values.catId as number,
        partnerClinic: values.partnerClinic.trim(),
        veterinarian: values.veterinarian.trim(),
        crmv: values.crmv.trim(),
        attendanceDate: values.attendanceDate,
        diagnosis: values.diagnosis.trim(),
        attachedFile: fileName,
      })
      .pipe(
        finalize(() => this.saving.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () =>
          void this.router.navigate(['/medical-records', values.catId]),
        error: (error: HttpErrorResponse) => this.handleSaveError(error),
      });
  }

  private loadCats(): void {
    this.loadingCats.set(true);
    this.loadError.set(null);

    this.catService
      .list({ page: 0, size: 100 })
      .pipe(
        finalize(() => this.loadingCats.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (page) => this.cats.set(page.content),
        error: () =>
          this.loadError.set(
            'Não foi possível carregar os gatos. Tente novamente.',
          ),
      });
  }

  private loadClinics(): void {
    this.loadingClinics.set(true);
    this.clinicLoadMessage.set(null);

    this.externalAttendanceService
      .listClinics()
      .pipe(
        catchError(() => {
          this.clinicLoadMessage.set(
            'Nenhuma clínica parceira está disponível no sistema no momento.',
          );
          return of([]);
        }),
        finalize(() => this.loadingClinics.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((clinics) => this.partnerClinics.set(clinics));
  }

  private handleSaveError(error: HttpErrorResponse): void {
    this.saveError.set(
      error.status === 400
        ? 'Revise os dados do atendimento e tente novamente.'
        : 'Não foi possível salvar o atendimento externo. Tente novamente.',
    );
  }
}
