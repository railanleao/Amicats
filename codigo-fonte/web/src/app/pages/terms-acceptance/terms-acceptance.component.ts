import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { SubmitButtonComponent } from '../../components/submit-button/submit-button.component';
import { AuthService } from '../../services/resources/auth.service';

@Component({
  selector: 'app-terms-acceptance',
  imports: [SubmitButtonComponent],
  templateUrl: './terms-acceptance.component.html',
  styleUrl: './terms-acceptance.component.css',
})
export class TermsAcceptanceComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly accepted = signal(false);
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  toggleAccepted(): void {
    this.accepted.update((value) => !value);
  }

  onContinue(): void {
    if (!this.accepted()) {
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    this.authService
      .acceptTerms()
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () =>
          this.router.navigateByUrl(
            this.authService.mustChangePassword() ? '/definir-nova-senha' : '/',
          ),
        error: () =>
          this.errorMessage.set(
            'Não foi possível registrar o aceite. Tente novamente em instantes.',
          ),
      });
  }
}
