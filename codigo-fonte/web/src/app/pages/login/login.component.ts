import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthLayoutComponent } from '../../components/auth-layout/auth-layout.component';
import { SubmitButtonComponent } from '../../components/submit-button/submit-button.component';
import { TextFieldComponent } from '../../components/text-field/text-field.component';
import { AuthService } from '../../services/resources/auth.service';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    AuthLayoutComponent,
    TextFieldComponent,
    SubmitButtonComponent,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  readonly emailErrorMessages: Record<string, string> = {
    required: 'Informe seu e-mail.',
    email: 'Informe um e-mail válido.',
  };

  readonly passwordErrorMessages: Record<string, string> = {
    required: 'Informe sua senha.',
  };

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    this.authService
      .login(this.form.getRawValue())
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => this.router.navigateByUrl('/'),
        error: (error: HttpErrorResponse) =>
          this.errorMessage.set(
            error.status === 401
              ? 'E-mail ou senha inválidos.'
              : 'Não foi possível entrar. Tente novamente em instantes.',
          ),
      });
  }
}
