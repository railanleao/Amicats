import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, finalize, of, switchMap } from 'rxjs';

import { CatCoverComponent } from '../../components/cat-cover/cat-cover.component';
import { SubmitButtonComponent } from '../../components/submit-button/submit-button.component';
import { TextFieldComponent } from '../../components/text-field/text-field.component';
import { formatAge, parseAgeText } from '../../lib/cat-age';
import { felvResult, fivResult, neuteringLabel, testTagLabel } from '../../lib/cat-health';
import { transferDateTimeLabel, transferFromLabel } from '../../lib/room-transfer-format';
import {
  Cat,
  CreateCatRequest,
  GENERAL_STATUS_LABELS,
  GeneralStatus,
  PIF_RESULT_LABELS,
  Sex,
  SEX_LABELS,
} from '../../models/cat.model';
import { RoomTransfer } from '../../models/room-transfer.model';
import { Room } from '../../models/room.model';
import { CatService } from '../../services/resources/cat.service';
import { RoomService } from '../../services/resources/room.service';
import { RoomTransferService } from '../../services/resources/room-transfer.service';

export type CatFormMode = 'create' | 'edit';

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const PHOTO_TYPES = ['image/jpeg', 'image/png'];

@Component({
  selector: 'app-cat-form',
  standalone: true,
  imports: [
    CatCoverComponent,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    SubmitButtonComponent,
    TextFieldComponent,
  ],
  templateUrl: './cat-form.component.html',
  styleUrl: './cat-form.component.css',
})
export class CatFormComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly catService = inject(CatService);
  private readonly roomService = inject(RoomService);
  private readonly roomTransferService = inject(RoomTransferService);
  private readonly destroyRef = inject(DestroyRef);

  readonly mode: CatFormMode = this.route.snapshot.data['mode'] ?? 'create';
  readonly isEditing = this.mode === 'edit';
  readonly catId: number | null = this.isEditing
    ? Number(this.route.snapshot.paramMap.get('id'))
    : null;
  readonly title = this.isEditing ? 'Editar gato' : 'Novo gato';
  readonly submitLabel = this.isEditing ? 'Salvar alterações' : 'Salvar gato';

  readonly sexOptions = this.toOptions(SEX_LABELS);
  readonly generalStatusOptions = this.toOptions(GENERAL_STATUS_LABELS);

  readonly cat = signal<Cat | null>(null);
  readonly loading = signal(false);
  readonly loadError = signal<string | null>(null);

  readonly saving = signal(false);
  readonly saveError = signal<string | null>(null);

  readonly rooms = signal<Room[]>([]);
  readonly roomsError = signal<string | null>(null);

  readonly transferHistory = signal<RoomTransfer[]>([]);
  readonly transferDateTimeLabel = transferDateTimeLabel;
  readonly transferFromLabel = transferFromLabel;

  // In edit mode, "Nascimento estimado" is edited as a free-text estimated age ("4 anos")
  // instead of a calendar date — matching how staff actually estimate a stray cat's age — and
  // converted back to an approximate estimatedBirthDate on save. See parseAgeText.
  ageYearsText = '';

  readonly photoVersion = signal(0);
  readonly photoBusy = signal(false);
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

    if (this.isEditing) {
      this.loadCat();
    }
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

  // FIV/FeLV/PIF/castration have no update endpoint yet (see cat.model.ts) — shown read-only
  // here until a clinical use case exists to edit them from this screen.
  get fivLabel(): string {
    return testTagLabel(fivResult(this.cat()?.healthStatus));
  }

  get felvLabel(): string {
    return testTagLabel(felvResult(this.cat()?.healthStatus));
  }

  get pifLabel(): string {
    const result = this.cat()?.pifResult;
    return result ? PIF_RESULT_LABELS[result] : testTagLabel('not-tested');
  }

  get neuteringLabel(): string {
    return neuteringLabel(this.cat()?.neuteringStatus ?? undefined);
  }

  get createdAtLabel(): string {
    const createdAt = this.cat()?.createdAt;
    return createdAt
      ? new Intl.DateTimeFormat('pt-BR').format(new Date(createdAt))
      : '—';
  }

  get hasPhoto(): boolean {
    return this.isEditing
      ? !!this.cat()?.photoUrl
      : this.pendingPhoto() !== null;
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

    if (this.catId === null) {
      return;
    }

    this.photoBusy.set(true);

    this.catService
      .uploadPhoto(this.catId, file)
      .pipe(
        finalize(() => this.photoBusy.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (updated) => {
          this.cat.set(updated);
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

    if (this.catId === null || this.photoBusy()) {
      return;
    }

    this.photoBusy.set(true);
    this.photoError.set(null);

    this.catService
      .removePhoto(this.catId)
      .pipe(
        finalize(() => this.photoBusy.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          const current = this.cat();
          if (current) {
            this.cat.set({ ...current, photoUrl: null });
          }
          this.photoVersion.update((version) => version + 1);
        },
        error: () =>
          this.photoError.set(
            'Não foi possível remover a foto. Tente novamente.',
          ),
      });
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
    // In edit mode the date input is replaced by the free-text "Idade estimada" field; fall
    // back to the form's own value (unchanged since fillForm) when that text doesn't parse.
    const estimatedBirthDate = this.isEditing
      ? (parseAgeText(this.ageYearsText) ?? (values.estimatedBirthDate || null))
      : values.estimatedBirthDate || null;
    const request: CreateCatRequest = {
      name: values.name.trim(),
      roomId: values.roomId,
      sex: values.sex || null,
      estimatedBirthDate,
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

    if (this.isEditing) {
      this.catService
        .update(this.catId as number, request)
        .pipe(
          finalize(() => this.saving.set(false)),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe({
          next: () => void this.router.navigate(['/cats']),
          error: (error: HttpErrorResponse) => this.handleSaveError(error),
        });
      return;
    }

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
          void this.router.navigate(['/cats']);
        },
        error: (error: HttpErrorResponse) => this.handleSaveError(error),
      });
  }

  private loadCat(): void {
    if (this.catId === null || !Number.isInteger(this.catId)) {
      this.loadError.set('Gato não encontrado.');
      return;
    }

    this.loading.set(true);

    this.catService
      .findById(this.catId)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (cat) => this.fillForm(cat),
        error: (error: HttpErrorResponse) =>
          this.loadError.set(
            error.status === 404
              ? 'Gato não encontrado.'
              : 'Não foi possível carregar o gato. Tente novamente.',
          ),
      });

    this.roomTransferService
      .list(this.catId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (transfers) => this.transferHistory.set(transfers),
        error: () => this.transferHistory.set([]),
      });
  }

  private fillForm(cat: Cat): void {
    this.cat.set(cat);
    this.ageYearsText = formatAge(cat.estimatedBirthDate) ?? '';
    this.form.patchValue({
      name: cat.name,
      sex: cat.sex ?? '',
      estimatedBirthDate: cat.estimatedBirthDate ?? '',
      coat: cat.coat ?? '',
      weightKg:
        cat.weightKg != null ? String(cat.weightKg).replace('.', ',') : '',
      microchip: cat.microchip ?? '',
      roomId: cat.roomId,
      characteristics: cat.characteristics ?? '',
      generalStatus: cat.generalStatus ?? '',
      rescueDate: cat.rescueDate ?? '',
      foundConditions: cat.foundConditions ?? '',
      sponsorName: cat.sponsorName ?? '',
      sponsorPhone: cat.sponsorPhone ?? '',
      sponsorFunding: cat.sponsorFunding ?? '',
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
      this.saveError.set(
        this.isEditing
          ? 'Você não tem permissão para editar gatinhos.'
          : 'Você não tem permissão para cadastrar gatinhos.',
      );
    } else if (error.status === 404) {
      this.saveError.set('A sala selecionada não existe mais. Escolha outra.');
    } else if (error.status === 400) {
      this.saveError.set('Confira os dados informados e tente novamente.');
    } else {
      this.saveError.set('Não foi possível salvar o gatinho. Tente novamente.');
    }
  }
}
