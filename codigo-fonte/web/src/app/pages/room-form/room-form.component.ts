import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import { SubmitButtonComponent } from '../../components/submit-button/submit-button.component';
import { TextFieldComponent } from '../../components/text-field/text-field.component';
import { ToggleComponent } from '../../components/toggle/toggle.component';
import { Room } from '../../models/room.model';
import { RoomService } from '../../services/resources/room.service';

export type RoomFormMode = 'create' | 'edit';

@Component({
  selector: 'app-room-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    ConfirmDialogComponent,
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

  readonly room = signal<Room | null>(null);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly saveError = signal<string | null>(null);

  readonly statusDialog = signal<'deactivate' | 'activate' | null>(null);
  readonly statusSaving = signal(false);
  readonly statusError = signal<string | null>(null);

  readonly form = new FormGroup({
    title: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(100)],
    }),
    coverImageUrl: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(500)],
    }),
    maxCapacity: new FormControl<number | null>(null, { validators: [Validators.min(1)] }),
    description: new FormControl('', { nonNullable: true }),
  });

  readonly errors = {
    title: {
      required: 'Informe o nome da sala.',
      maxlength: 'O nome deve ter no máximo 100 caracteres.',
    },
    coverImageUrl: { maxlength: 'A URL deve ter no máximo 500 caracteres.' },
  };

  get isActive(): boolean {
    return this.room()?.active ?? true;
  }

  constructor() {
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
      coverImageUrl: values.coverImageUrl.trim() || null,
      maxCapacity: values.maxCapacity,
    };

    this.saving.set(true);

    const request = this.isEditing
      ? this.roomService.update(this.roomId as number, payload)
      : this.roomService.create(payload);

    request
      .pipe(
        finalize(() => this.saving.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => void this.router.navigate(['/rooms']),
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
      coverImageUrl: room.coverImageUrl ?? '',
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
