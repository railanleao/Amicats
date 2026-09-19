import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { SubmitButtonComponent } from '../../components/submit-button/submit-button.component';
import { TextFieldComponent } from '../../components/text-field/text-field.component';
import { AccessType } from '../../models/auth.model';
import { ACCESS_TYPE_LABELS, User } from '../../models/user.model';
import { AuthService } from '../../services/resources/auth.service';
import { UserService } from '../../services/resources/user.service';

export type UserFormMode = 'create' | 'edit';

const UF_PATTERN = /^[A-Za-z]{2}$/;

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, TextFieldComponent, SubmitButtonComponent],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.css',
})
export class UserFormComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  readonly mode: UserFormMode = this.route.snapshot.data['mode'];
  readonly isEditing = this.mode === 'edit';
  readonly userId: number | null = this.isEditing
    ? Number(this.route.snapshot.paramMap.get('id'))
    : null;
  readonly title = this.isEditing ? 'Editar usuário' : 'Novo usuário';
  readonly submitLabel = this.isEditing ? 'Salvar alterações' : 'Cadastrar usuário';

  readonly accessTypeOptions = (Object.keys(ACCESS_TYPE_LABELS) as AccessType[]).map((value) => ({
    value,
    label: ACCESS_TYPE_LABELS[value],
  }));

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly saveError = signal<string | null>(null);

  readonly form = new FormGroup({
    fullName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(150)],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email, Validators.maxLength(150)],
    }),
    phoneNumber: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(20)],
    }),
    accessType: new FormControl<AccessType | ''>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    crmv: new FormControl('', { nonNullable: true }),
    ufCrmv: new FormControl('', { nonNullable: true }),
  });

  readonly errors = {
    fullName: {
      required: 'Informe o nome completo.',
      maxlength: 'O nome deve ter no máximo 150 caracteres.',
    },
    email: {
      required: 'Informe o e-mail.',
      email: 'Informe um e-mail válido.',
      maxlength: 'O e-mail deve ter no máximo 150 caracteres.',
    },
    phoneNumber: { maxlength: 'O telefone deve ter no máximo 20 caracteres.' },
    crmv: {
      required: 'Informe o CRMV.',
      maxlength: 'O CRMV deve ter no máximo 20 caracteres.',
    },
    ufCrmv: {
      required: 'Informe a UF.',
      pattern: 'Use a sigla com 2 letras.',
    },
  };

  constructor() {
    this.applyCrmvRules(this.form.controls.accessType.value);
    this.form.controls.accessType.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((accessType) => this.applyCrmvRules(accessType));

    if (this.isEditing) {
      this.loadUser();
    }
  }

  get showCrmv(): boolean {
    return this.form.controls.accessType.value === 'Veterinarian';
  }

  get isSelf(): boolean {
    return this.isEditing && this.userId === this.authService.currentUser()?.id;
  }

  get initials(): string {
    const parts = this.form.controls.fullName.value.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) {
      return '?';
    }
    const first = parts[0][0];
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase();
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
    const accessType = values.accessType as AccessType;
    const isVeterinarian = accessType === 'Veterinarian';
    const profile = {
      fullName: values.fullName.trim(),
      phoneNumber: values.phoneNumber.trim() || null,
      accessType,
      crmv: isVeterinarian ? values.crmv.trim() || null : null,
      ufCrmv: isVeterinarian ? values.ufCrmv.trim().toUpperCase() || null : null,
    };

    this.saving.set(true);

    if (this.isEditing) {
      this.userService
        .update(this.userId as number, profile)
        .pipe(
          finalize(() => this.saving.set(false)),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe({
          next: () => void this.router.navigate(['/users']),
          error: (error: HttpErrorResponse) => this.handleSaveError(error),
        });
      return;
    }

    this.userService
      .create({ ...profile, email: values.email.trim() })
      .pipe(
        finalize(() => this.saving.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (created) =>
          void this.router.navigate(['/users', created.id, 'edit'], {
            state: { created: true },
          }),
        error: (error: HttpErrorResponse) => this.handleSaveError(error),
      });
  }

  private loadUser(): void {
    if (this.userId === null || !Number.isInteger(this.userId)) {
      this.loadError.set('Usuário não encontrado.');
      return;
    }

    this.loading.set(true);

    this.userService
      .findById(this.userId)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (user) => this.fillForm(user),
        error: (error: HttpErrorResponse) =>
          this.loadError.set(
            error.status === 404
              ? 'Usuário não encontrado.'
              : 'Não foi possível carregar o usuário. Tente novamente.',
          ),
      });
  }

  private fillForm(user: User): void {
    this.form.patchValue({
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber ?? '',
      accessType: user.accessType,
      crmv: user.crmv ?? '',
      ufCrmv: user.ufCrmv ?? '',
    });

    if (this.isSelf) {
      this.form.controls.accessType.disable();
    }
  }

  private applyCrmvRules(accessType: AccessType | ''): void {
    const required = accessType === 'Veterinarian';
    const { crmv, ufCrmv } = this.form.controls;

    crmv.setValidators(
      required
        ? [Validators.required, Validators.maxLength(20)]
        : [Validators.maxLength(20)],
    );
    ufCrmv.setValidators(
      required
        ? [Validators.required, Validators.pattern(UF_PATTERN)]
        : [Validators.pattern(UF_PATTERN)],
    );
    crmv.updateValueAndValidity({ emitEvent: false });
    ufCrmv.updateValueAndValidity({ emitEvent: false });
  }

  private handleSaveError(error: HttpErrorResponse): void {
    if (error.status === 409) {
      this.saveError.set(
        this.isEditing
          ? 'Você não pode alterar o seu próprio tipo de acesso.'
          : 'Este e-mail já está cadastrado.',
      );
    } else if (error.status === 400) {
      this.saveError.set('Confira os dados informados e tente novamente.');
    } else if (error.status === 404) {
      this.saveError.set('Usuário não encontrado.');
    } else {
      this.saveError.set('Não foi possível salvar o usuário. Tente novamente.');
    }
  }
}
