import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable, catchError, finalize, map, of, switchMap } from 'rxjs';

import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import { RoomCoverComponent } from '../../components/room-cover/room-cover.component';
import { SubmitButtonComponent } from '../../components/submit-button/submit-button.component';
import { TextFieldComponent } from '../../components/text-field/text-field.component';
import { ToggleComponent } from '../../components/toggle/toggle.component';
import { Room } from '../../models/room.model';
import { RoomService } from '../../services/resources/room.service';

export type RoomFormMode = 'create' | 'edit';

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const PHOTO_TYPES = ['image/jpeg', 'image/png'];

@Component({
  selector: 'app-room-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    ConfirmDialogComponent,
    RoomCoverComponent,
    SubmitButtonComponent,
    TextFieldComponent,
    ToggleComponent,
  ],
  templateUrl: './room-form.component.html',
  styleUrl: './room-form.component.css',
})
export class RoomFormComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly roomService = inject(RoomService);
  private readonly destroyRef = inject(DestroyRef);

  readonly mode: RoomFormMode = this.route.snapshot.data['mode'];
  readonly isEditing = this.mode === 'edit';
  readonly roomId: number | null = this.isEditing
    ? Number(this.route.snapshot.paramMap.get('id'))
    : null;
  readonly title = this.isEditing ? 'Editar sala' : 'Nova sala';
  readonly submitLabel = this.isEditing ? 'Salvar alterações' : 'Cadastrar sala';
  readonly justCreated = this.isEditing && history.state?.created === true;
  readonly photoFailed = this.isEditing && history.state?.photoFailed === true;

  readonly room = signal<Room | null>(null);
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

  readonly form = new FormGroup({
    title: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(100)],
    }),
    maxCapacity: new FormControl<number | null>(null, { validators: [Validators.min(1)] }),
    description: new FormControl('', { nonNullable: true }),
  });

  readonly errors = {
    title: {
      required: 'Informe o nome da sala.',
      maxlength: 'O nome deve ter no máximo 100 caracteres.',
    },
  };

  get isActive(): boolean {
    return this.room()?.active ?? true;
  }

  get hasPhoto(): boolean {
    return this.isEditing ? !!this.room()?.coverImageUrl : this.pendingPhoto() !== null;
  }

  constructor() {
    this.destroyRef.onDestroy(() => this.releasePendingPhoto());

    if (this.isEditing) {
      this.loadRoom();
    }
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
    const payload = {
      title: values.title.trim(),
      description: values.description.trim() || null,
      maxCapacity: values.maxCapacity,
    };

    this.saving.set(true);

    if (this.isEditing) {
      this.roomService
        .update(this.roomId as number, payload)
        .pipe(
          finalize(() => this.saving.set(false)),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe({
          next: () => void this.router.navigate(['/rooms']),
          error: (error: HttpErrorResponse) => this.handleSaveError(error),
        });
      return;
    }

    this.roomService
      .create(payload)
      .pipe(
        switchMap((created) => this.uploadChosenPhoto(created)),
        finalize(() => this.saving.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: ({ created, photoFailed }) =>
          void this.router.navigate(['/rooms', created.id, 'edit'], {
            state: { created: true, photoFailed },
          }),
        error: (error: HttpErrorResponse) => this.handleSaveError(error),
      });
  }

  onToggleStatus(): void {
    const room = this.room();
    if (!room || this.statusSaving()) {
      return;
    }
    this.statusDialog.set(room.active ? 'deactivate' : 'activate');
  }

  cancelStatusChange(): void {
    this.statusDialog.set(null);
  }

  confirmStatusChange(): void {
    const action = this.statusDialog();
    const room = this.room();
    if (!action || !room) {
      return;
    }

    this.statusSaving.set(true);
    this.statusError.set(null);

    const request =
      action === 'deactivate'
        ? this.roomService.deactivate(room.id)
        : this.roomService.activate(room.id);

    request
      .pipe(
        finalize(() => this.statusSaving.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.room.set({ ...room, active: action === 'activate' });
          this.statusDialog.set(null);
        },
        error: () => {
          this.statusError.set('Não foi possível alterar o status. Tente novamente.');
          this.statusDialog.set(null);
        },
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

    if (this.roomId === null) {
      return;
    }

    this.photoBusy.set(true);

    this.roomService
      .uploadPhoto(this.roomId, file)
      .pipe(
        finalize(() => this.photoBusy.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (updated) => {
          this.room.set(updated);
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

    if (this.roomId === null || this.photoBusy()) {
      return;
    }

    this.photoBusy.set(true);
    this.photoError.set(null);

    this.roomService
      .removePhoto(this.roomId)
      .pipe(
        finalize(() => this.photoBusy.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          const current = this.room();
          if (current) {
            this.room.set({ ...current, coverImageUrl: null });
          }
          this.photoVersion.update((version) => version + 1);
        },
        error: () => this.photoError.set('Não foi possível remover a foto. Tente novamente.'),
      });
  }

  private uploadChosenPhoto(created: Room): Observable<{ created: Room; photoFailed: boolean }> {
    const photo = this.pendingPhoto();
    if (!photo) {
      return of({ created, photoFailed: false });
    }

    return this.roomService.uploadPhoto(created.id, photo).pipe(
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

  private loadRoom(): void {
    if (this.roomId === null || !Number.isInteger(this.roomId)) {
      this.loadError.set('Sala não encontrada.');
      return;
    }

    this.loading.set(true);

    this.roomService
      .findById(this.roomId)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (room) => this.fillForm(room),
        error: (error: HttpErrorResponse) =>
          this.loadError.set(
            error.status === 404
              ? 'Sala não encontrada.'
              : 'Não foi possível carregar a sala. Tente novamente.',
          ),
      });
  }

  private fillForm(room: Room): void {
    this.room.set(room);
    this.form.patchValue({
      title: room.title,
      maxCapacity: room.maxCapacity,
      description: room.description ?? '',
    });
  }

  private handleSaveError(error: HttpErrorResponse): void {
    if (error.status === 404) {
      this.saveError.set('Sala não encontrada.');
    } else if (error.status === 400) {
      this.saveError.set('Confira os dados informados e tente novamente.');
    } else {
      this.saveError.set('Não foi possível salvar a sala. Tente novamente.');
    }
  }
}
