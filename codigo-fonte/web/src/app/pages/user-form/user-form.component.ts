import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable, catchError, finalize, map, of, switchMap } from 'rxjs';

import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import { SubmitButtonComponent } from '../../components/submit-button/submit-button.component';
import { TextFieldComponent } from '../../components/text-field/text-field.component';
import { ToggleComponent } from '../../components/toggle/toggle.component';
import { UserAvatarComponent } from '../../components/user-avatar/user-avatar.component';
import { AccessType } from '../../models/auth.model';
import { ACCESS_TYPE_LABELS, User } from '../../models/user.model';
import { AuthService } from '../../services/resources/auth.service';
import { UserService } from '../../services/resources/user.service';

export type UserFormMode = 'create' | 'edit';

const UF_PATTERN = /^[A-Za-z]{2}$/;
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const PHOTO_TYPES = ['image/jpeg', 'image/png'];

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    DatePipe,
    ReactiveFormsModule,
    RouterLink,
    ConfirmDialogComponent,
    SubmitButtonComponent,
    TextFieldComponent,
    ToggleComponent,
    UserAvatarComponent,
  ],
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
  readonly justCreated = this.isEditing && history.state?.created === true;
  readonly photoFailed = this.isEditing && history.state?.photoFailed === true;

  readonly accessTypeOptions = (Object.keys(ACCESS_TYPE_LABELS) as AccessType[]).map((value) => ({
    value,
    label: ACCESS_TYPE_LABELS[value],
  }));

  readonly user = signal<User | null>(null);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly saveError = signal<string | null>(null);

  readonly photoVersion = signal(0);
  readonly photoBusy = signal(false);
  readonly photoError = signal<string | null>(null);
  readonly pendingPhoto = signal<File | null>(null);
  readonly pendingPhotoUrl = signal<string | null>(null);

  readonly statusDialog = signal<'deactivate' | 'activate' | null>(null);
  readonly statusSaving = signal(false);
  readonly statusError = signal<string | null>(null);

  readonly resetting = signal(false);
  readonly resetMessage = signal<string | null>(null);
  readonly resetError = signal<string | null>(null);

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
    if (this.isEditing) {
      this.form.controls.email.clearValidators();
    }

    this.applyCrmvRules(this.form.controls.accessType.value);
    this.form.controls.accessType.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((accessType) => this.applyCrmvRules(accessType));

    this.destroyRef.onDestroy(() => this.releasePendingPhoto());

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

  get isActive(): boolean {
    return this.user()?.active ?? true;
  }

  get hasPhoto(): boolean {
    return this.isEditing ? !!this.user()?.imageUrl : this.pendingPhoto() !== null;
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
        switchMap((created) => this.uploadChosenPhoto(created)),
        finalize(() => this.saving.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: ({ created, photoFailed }) =>
          void this.router.navigate(['/users', created.id, 'edit'], {
            state: { created: true, photoFailed },
          }),
        error: (error: HttpErrorResponse) => this.handleSaveError(error),
      });
  }

  onToggleStatus(): void {
    const user = this.user();
    if (!user || this.isSelf || this.statusSaving()) {
      return;
    }
    this.statusDialog.set(user.active ? 'deactivate' : 'activate');
  }

  cancelStatusChange(): void {
    this.statusDialog.set(null);
  }

  confirmStatusChange(): void {
    const action = this.statusDialog();
    const user = this.user();
    if (!action || !user) {
      return;
    }

    this.statusSaving.set(true);
    this.statusError.set(null);

    const request =
      action === 'deactivate'
        ? this.userService.deactivate(user.id)
        : this.userService.activate(user.id);

    request
      .pipe(
        finalize(() => this.statusSaving.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.user.set({ ...user, active: action === 'activate' });
          this.statusDialog.set(null);
        },
        error: (error: HttpErrorResponse) => {
          this.statusError.set(
            error.status === 409
              ? 'Você não pode desativar a sua própria conta.'
              : 'Não foi possível alterar o status. Tente novamente.',
          );
          this.statusDialog.set(null);
        },
      });
  }

  resetPassword(): void {
    if (!this.isEditing || this.resetting()) {
      return;
    }

    this.resetting.set(true);
    this.resetMessage.set(null);
    this.resetError.set(null);

    this.authService
      .forgotPassword({ email: this.form.controls.email.value })
      .pipe(
        finalize(() => this.resetting.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () =>
          this.resetMessage.set(
            'Se o e-mail estiver cadastrado e ativo, enviamos uma senha temporária.',
          ),
        error: (error: HttpErrorResponse) =>
          this.resetError.set(
            error.status === 429
              ? 'Muitas tentativas. Aguarde um minuto e tente novamente.'
              : 'Não foi possível enviar o e-mail. Tente novamente.',
          ),
      });
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';

    if (!file || this.photoBusy()) {
      return;
    }

    this.photoError.set(null);

    if (!PHOTO_TYPES.includes(file.type)) {
      this.photoError.set('Envie uma imagem JPG ou PNG.');
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      this.photoError.set('A foto deve ter no máximo 5 MB.');
      return;
    }

    if (!this.isEditing) {
      this.releasePendingPhoto();
      this.pendingPhoto.set(file);
      this.pendingPhotoUrl.set(URL.createObjectURL(file));
      return;
    }

    if (this.userId === null) {
      return;
    }

    this.photoBusy.set(true);

    this.userService
      .uploadPhoto(this.userId, file)
      .pipe(
        finalize(() => this.photoBusy.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (updated) => {
          this.user.set(updated);
          this.photoVersion.update((version) => version + 1);
        },
        error: (error: HttpErrorResponse) =>
          this.photoError.set(
            error.status === 400
              ? 'Não foi possível usar essa imagem. Envie um JPG ou PNG válido de até 5 MB.'
              : 'Não foi possível enviar a foto. Tente novamente.',
          ),
      });
  }

  removePhoto(): void {
    if (!this.isEditing) {
      this.releasePendingPhoto();
      this.photoError.set(null);
      return;
    }

    if (this.userId === null || this.photoBusy()) {
      return;
    }

    this.photoBusy.set(true);
    this.photoError.set(null);

    this.userService
      .removePhoto(this.userId)
      .pipe(
        finalize(() => this.photoBusy.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          const current = this.user();
          if (current) {
            this.user.set({ ...current, imageUrl: null });
          }
          this.photoVersion.update((version) => version + 1);
        },
        error: () => this.photoError.set('Não foi possível remover a foto. Tente novamente.'),
      });
  }

  private uploadChosenPhoto(created: User): Observable<{ created: User; photoFailed: boolean }> {
    const photo = this.pendingPhoto();
    if (!photo) {
      return of({ created, photoFailed: false });
    }

    return this.userService.uploadPhoto(created.id, photo).pipe(
      map(() => ({ created, photoFailed: false })),
      catchError(() => of({ created, photoFailed: true })),
    );
  }

  private releasePendingPhoto(): void {
    const url = this.pendingPhotoUrl();
    if (url) {
      URL.revokeObjectURL(url);
    }
    this.pendingPhotoUrl.set(null);
    this.pendingPhoto.set(null);
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
    this.user.set(user);
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
      required ? [Validators.required, Validators.maxLength(20)] : [Validators.maxLength(20)],
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
    } else if (error.status === 502) {
      this.saveError.set(
        'O usuário não foi cadastrado porque não foi possível enviar o e-mail de acesso. Tente novamente.',
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
