import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

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

const MAX_ATTACHMENT_SIZE = 5 * 1024 * 1024;
const ALLOWED_ATTACHMENT_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const ALLOWED_ATTACHMENT_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];

function notFutureDate(control: AbstractControl): ValidationErrors | null {
  const value = control.value as string | null;
  if (!value) return null;
  const today = new Date();
  const [year, month, day] = value.split('-').map(Number);
  const selected = new Date(year, month - 1, day);
  const current = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  return selected > current ? { futureDate: true } : null;
}

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

  readonly catId = Number(this.route.snapshot.paramMap.get('id'));
  readonly cat = signal<Cat | null>(null);
  readonly loading = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly saving = signal(false);
  readonly saveError = signal<string | null>(null);
  readonly selectedFile = signal<File | null>(null);
  readonly selectedFileError = signal<string | null>(null);
  readonly today = new Date().toISOString().slice(0, 10);

  readonly form = new FormGroup({
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
      validators: [Validators.required, notFutureDate],
    }),
    diagnosis: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(2000)],
    }),
  });

  readonly errors = {
    partnerClinic: {
      required: 'Informe a clínica parceira.',
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
      futureDate: 'A data do atendimento não pode ser futura.',
    },
    diagnosis: {
      required: 'Informe o diagnóstico ou as observações.',
      maxlength: 'O diagnóstico deve ter no máximo 2000 caracteres.',
    },
  };

  ngOnInit(): void {
    if (!Number.isInteger(this.catId) || this.catId <= 0) {
      this.loadError.set('Gatinho não encontrado.');
      return;
    }
    this.loadCat();
  }

  get selectedCatDetails(): string {
    const cat = this.cat();
    if (!cat) return '';
    return [
      cat.sex ? SEX_LABELS[cat.sex] : null,
      cat.ageGroup ? AGE_GROUP_LABELS[cat.ageGroup] : null,
      cat.healthStatus ? HEALTH_STATUS_LABELS[cat.healthStatus] : null,
    ]
      .filter((part): part is string => !!part)
      .join(' · ');
  }

  get selectedCatStatus(): string {
    const cat = this.cat();
    return cat
      ? GENERAL_STATUS_LABELS[cat.generalStatus]
      : 'Nenhum gato selecionado';
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.selectedFileError.set(null);
    this.selectedFile.set(null);

    if (!file) return;

    const extension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    if (
      !ALLOWED_ATTACHMENT_TYPES.includes(file.type) ||
      !ALLOWED_ATTACHMENT_EXTENSIONS.includes(extension)
    ) {
      this.selectedFileError.set('Selecione um arquivo PDF, JPG ou PNG.');
      input.value = '';
      return;
    }

    if (file.size > MAX_ATTACHMENT_SIZE) {
      this.selectedFileError.set('O arquivo deve ter no máximo 5 MB.');
      input.value = '';
      return;
    }

    this.selectedFile.set(file);
  }

  onSubmit(): void {
    if (this.saving()) return;
    this.saveError.set(null);

    if (this.form.invalid || !this.selectedFile()) {
      this.form.markAllAsTouched();
      if (!this.selectedFile())
        this.selectedFileError.set(
          'Selecione o arquivo do atendimento recebido.',
        );
      return;
    }

    const values = this.form.getRawValue();
    this.saving.set(true);

    this.externalAttendanceService
      .create({
        catId: this.catId,
        partnerClinic: values.partnerClinic.trim(),
        veterinarian: values.veterinarian.trim(),
        crmv: values.crmv.trim(),
        attendanceDate: values.attendanceDate,
        diagnosis: values.diagnosis.trim(),
        file: this.selectedFile()!,
      })
      .pipe(
        finalize(() => this.saving.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => void this.router.navigate(['/medical-records', this.catId]),
        error: (error: HttpErrorResponse) => this.handleSaveError(error),
      });
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
              : 'Não foi possível carregar o gato. Tente novamente.',
          ),
      });
  }

  private handleSaveError(error: HttpErrorResponse): void {
    this.saveError.set(
      error.status === 400
        ? 'Revise os dados do atendimento e o arquivo anexado.'
        : 'Não foi possível salvar o atendimento externo. Tente novamente.',
    );
  }
}
