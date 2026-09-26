import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { catchError, finalize, of, switchMap } from 'rxjs';

import { SubmitButtonComponent } from '../../components/submit-button/submit-button.component';
import { TextFieldComponent } from '../../components/text-field/text-field.component';
import {
  CreateCatRequest,
  GENERAL_STATUS_LABELS,
  GeneralStatus,
  Sex,
  SEX_LABELS,
} from '../../models/cat.model';
import { Room } from '../../models/room.model';
import { CatService } from '../../services/resources/cat.service';
import { RoomService } from '../../services/resources/room.service';

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const PHOTO_TYPES = ['image/jpeg', 'image/png'];

@Component({
  selector: 'app-cat-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    SubmitButtonComponent,
    TextFieldComponent,
  ],
  templateUrl: './cat-form.component.html',
  styleUrl: './cat-form.component.css',
})
export class CatFormComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly catService = inject(CatService);
  private readonly roomService = inject(RoomService);
  private readonly destroyRef = inject(DestroyRef);

  readonly sexOptions = this.toOptions(SEX_LABELS);
  readonly generalStatusOptions = this.toOptions(GENERAL_STATUS_LABELS);

  readonly saving = signal(false);
  readonly saveError = signal<string | null>(null);

  readonly rooms = signal<Room[]>([]);
  readonly roomsError = signal<string | null>(null);

  readonly photoError = signal<string | null>(null);
  readonly pendingPhoto = signal<File | null>(null);
  readonly pendingPhotoUrl = signal<string | null>(null);

  readonly form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(100)],
    }),
    sex: new FormControl<Sex | ''>('', { nonNullable: true }),
    estimatedBirthDate: new FormControl('', { nonNullable: true }),
    coat: new FormControl('', { nonNullable: true }),
    weightKg: new FormControl('', { nonNullable: true }),
    microchip: new FormControl('', {
      nonNullable: true,
      validators: [Validators.pattern(/^\d{15}$/)],
    }),
    roomId: new FormControl<number | null>(null),
    characteristics: new FormControl('', { nonNullable: true }),
    generalStatus: new FormControl<GeneralStatus | ''>('', {
      nonNullable: true,
    }),
    rescueDate: new FormControl('', { nonNullable: true }),
    foundConditions: new FormControl('', { nonNullable: true }),
    sponsorName: new FormControl('', { nonNullable: true }),
    sponsorPhone: new FormControl('', { nonNullable: true }),
    sponsorFunding: new FormControl('', { nonNullable: true }),
  });

  readonly errors = {
    name: {
      required: 'Informe o nome do gatinho.',
      maxlength: 'O nome deve ter no máximo 100 caracteres.',
    },
    microchip: { pattern: 'O microchip tem 15 dígitos.' },
  };

  constructor() {
    this.destroyRef.onDestroy(() => this.releasePendingPhoto());
  }

  ngOnInit(): void {
    this.roomService
      .list({ active: true, page: 0, size: 100 })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (page) => this.rooms.set(page.content),
        error: (error: HttpErrorResponse) =>
          this.roomsError.set(
            error.status === 403
              ? 'Você não tem permissão para ver as salas. Peça a um Administrador.'
              : 'Não foi possível carregar as salas.',
          ),
      });
  }

  get hasPhoto(): boolean {
    return this.pendingPhoto() !== null;
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';

    if (!file) {
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

    this.releasePendingPhoto();
    this.pendingPhoto.set(file);
    this.pendingPhotoUrl.set(URL.createObjectURL(file));
  }

  removePhoto(): void {
    this.releasePendingPhoto();
    this.photoError.set(null);
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
    const request: CreateCatRequest = {
      name: values.name.trim(),
      roomId: values.roomId,
      sex: values.sex || null,
      estimatedBirthDate: values.estimatedBirthDate || null,
      coat: values.coat.trim() || null,
      weightKg: values.weightKg
        ? Number(values.weightKg.replace(',', '.'))
        : null,
      characteristics: values.characteristics.trim() || null,
      generalStatus: values.generalStatus || null,
      microchip: values.microchip.trim() || null,
      rescueDate: values.rescueDate || null,
      foundConditions: values.foundConditions.trim() || null,
      sponsorName: values.sponsorName.trim() || null,
      sponsorPhone: values.sponsorPhone.trim() || null,
      sponsorFunding: values.sponsorFunding.trim() || null,
    };

    this.saving.set(true);

    this.catService
      .create(request)
      .pipe(
        switchMap((created) => this.uploadChosenPhoto(created.id)),
        finalize(() => this.saving.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (photoFailed) => {
          if (photoFailed) {
            this.saveError.set(
              'O gatinho foi salvo, mas a foto não pôde ser enviada. Tente adicioná-la depois.',
            );
            this.releasePendingPhoto();
            return;
          }
          void this.router.navigate(['/']);
        },
        error: (error: HttpErrorResponse) => this.handleSaveError(error),
      });
  }

  private uploadChosenPhoto(catId: number) {
    const photo = this.pendingPhoto();
    if (!photo) {
      return of(false);
    }

    return this.catService.uploadPhoto(catId, photo).pipe(
      switchMap(() => of(false)),
      catchError(() => of(true)),
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

  private toOptions<T extends string>(
    labels: Record<T, string>,
  ): { value: T; label: string }[] {
    return (Object.keys(labels) as T[]).map((value) => ({
      value,
      label: labels[value],
    }));
  }

  private handleSaveError(error: HttpErrorResponse): void {
    if (error.status === 403) {
      this.saveError.set('Você não tem permissão para cadastrar gatinhos.');
    } else if (error.status === 404) {
      this.saveError.set('A sala selecionada não existe mais. Escolha outra.');
    } else if (error.status === 400) {
      this.saveError.set('Confira os dados informados e tente novamente.');
    } else {
      this.saveError.set('Não foi possível salvar o gatinho. Tente novamente.');
    }
  }
}
