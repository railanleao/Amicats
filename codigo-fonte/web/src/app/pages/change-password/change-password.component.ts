import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { SubmitButtonComponent } from '../../components/submit-button/submit-button.component';
import { TextFieldComponent } from '../../components/text-field/text-field.component';
import { AuthService } from '../../services/resources/auth.service';

@Component({
  selector: 'app-change-password',
  imports: [ReactiveFormsModule, TextFieldComponent, SubmitButtonComponent],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css',
})
export class ChangePasswordComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.formBuilder.nonNullable.group({
    currentPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmNewPassword: ['', [Validators.required]],
  });

  readonly currentPasswordErrorMessages: Record<string, string> = {
    required: 'Informe a senha atual.',
  };

  readonly newPasswordErrorMessages: Record<string, string> = {
    required: 'Informe a nova senha.',
    minlength: 'A nova senha precisa ter pelo menos 8 caracteres.',
  };

  readonly confirmNewPasswordErrorMessages: Record<string, string> = {
    required: 'Confirme a nova senha.',
  };

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { newPassword, confirmNewPassword } = this.form.getRawValue();
    if (newPassword !== confirmNewPassword) {
      this.errorMessage.set('A confirmação não confere com a nova senha.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    this.authService
      .changePassword(this.form.getRawValue())
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => this.router.navigateByUrl('/'),
        error: (error: HttpErrorResponse) =>
          this.errorMessage.set(
            error.status === 400
              ? 'Não foi possível trocar a senha. Confira a senha atual e tente novamente.'
              : 'Não foi possível trocar a senha. Tente novamente em instantes.',
          ),
      });
  }
}
