import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { catchError, finalize, forkJoin, map, of, switchMap } from 'rxjs';

import { SubmitButtonComponent } from '../../components/submit-button/submit-button.component';
import { TextFieldComponent } from '../../components/text-field/text-field.component';
import {
  CAT_CLINICAL_STATUS_LABELS,
  CAT_SEX_LABELS,
  CatClinicalStatus,
  CatSex,
  CreateCatRequest,
  HEALTH_TEST_RESULT_LABELS,
  HealthTestResult,
  NEUTERED_STATUS_LABELS,
  NeuteredStatus,
  RoomOption,
} from '../../models/cat.model';
import { CatService } from '../../services/resources/cat.service';

const MAX_PHOTOS = 6;
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
  private readonly destroyRef = inject(DestroyRef);

  readonly sexOptions = this.toOptions(CAT_SEX_LABELS);
  readonly healthTestOptions = this.toOptions(HEALTH_TEST_RESULT_LABELS);
  readonly neuteredOptions = this.toOptions(NEUTERED_STATUS_LABELS);
  readonly clinicalStatusOptions = this.toOptions(CAT_CLINICAL_STATUS_LABELS);

  readonly saving = signal(false);
  readonly saveError = signal<string | null>(null);

  readonly rooms = signal<RoomOption[]>([]);
  readonly roomsError = signal<string | null>(null);

  readonly pendingPhotos = signal<File[]>([]);
  readonly pendingPhotoUrls = signal<string[]>([]);
  readonly photoError = signal<string | null>(null);

  readonly form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(100)],
    }),
    sex: new FormControl<CatSex | ''>('', { nonNullable: true }),
    estimatedAge: new FormControl('', { nonNullable: true }),
    coat: new FormControl('', { nonNullable: true }),
    microchip: new FormControl('', {
      nonNullable: true,
      validators: [Validators.pattern(/^\d{15}$/)],
    }),
    roomId: new FormControl<number | null>(null),
    fiv: new FormControl<HealthTestResult | ''>('', { nonNullable: true }),
    felv: new FormControl<HealthTestResult | ''>('', { nonNullable: true }),
    pif: new FormControl<HealthTestResult | ''>('', { nonNullable: true }),
    neutered: new FormControl<NeuteredStatus | ''>('', { nonNullable: true }),
    clinicalStatus: new FormControl<CatClinicalStatus | ''>('', {
      nonNullable: true,
    }),
    healthNotes: new FormControl('', { nonNullable: true }),
    rescueDate: new FormControl('', { nonNullable: true }),
    rescueLocation: new FormControl('', { nonNullable: true }),
    sponsorName: new FormControl('', { nonNullable: true }),
    sponsorPhone: new FormControl('', { nonNullable: true }),
    sponsorCoverage: new FormControl('', { nonNullable: true }),
  });

  readonly errors = {
    name: {
      required: 'Informe o nome do gato.',
      maxlength: 'O nome deve ter no máximo 100 caracteres.',
    },
    microchip: { pattern: 'O microchip tem 15 dígitos.' },
  };

  constructor() {
    this.destroyRef.onDestroy(() =>
      this.pendingPhotoUrls().forEach((url) => URL.revokeObjectURL(url)),
    );
  }

  ngOnInit(): void {
    this.catService
      .listActiveRooms()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (rooms) => this.rooms.set(rooms),
        error: (error: HttpErrorResponse) =>
          this.roomsError.set(
            error.status === 403
              ? 'Você não tem permissão para ver as salas. Peça a um Administrador.'
              : 'Não foi possível carregar as salas.',
          ),
      });
  }

  get remainingPhotoSlots(): number {
    return MAX_PHOTOS - this.pendingPhotos().length;
  }

  onPhotosSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    input.value = '';

    if (files.length === 0) {
      return;
    }

    this.photoError.set(null);

    const accepted: File[] = [];
    for (const file of files) {
      if (!PHOTO_TYPES.includes(file.type)) {
        this.photoError.set('Envie imagens JPG ou PNG.');
        continue;
      }
      if (file.size > MAX_PHOTO_BYTES) {
        this.photoError.set('Cada foto deve ter no máximo 5 MB.');
        continue;
      }
      accepted.push(file);
    }

    const toAdd = accepted.slice(0, this.remainingPhotoSlots);
    if (accepted.length > toAdd.length) {
      this.photoError.set(`No máximo ${MAX_PHOTOS} fotos por gato.`);
    }

    this.pendingPhotos.update((current) => [...current, ...toAdd]);
    this.pendingPhotoUrls.update((current) => [
      ...current,
      ...toAdd.map((file) => URL.createObjectURL(file)),
    ]);
  }

  removePendingPhoto(index: number): void {
    URL.revokeObjectURL(this.pendingPhotoUrls()[index]);
    this.pendingPhotos.update((current) =>
      current.filter((_, i) => i !== index),
    );
    this.pendingPhotoUrls.update((current) =>
      current.filter((_, i) => i !== index),
    );
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
      estimatedAge: values.estimatedAge.trim() || null,
      coat: values.coat.trim() || null,
      microchip: values.microchip.trim() || null,
      fiv: values.fiv || null,
      felv: values.felv || null,
      pif: values.pif || null,
      neutered: values.neutered || null,
      clinicalStatus: values.clinicalStatus || null,
      healthNotes: values.healthNotes.trim() || null,
      rescueDate: values.rescueDate || null,
      rescueLocation: values.rescueLocation.trim() || null,
      sponsorName: values.sponsorName.trim() || null,
      sponsorPhone: values.sponsorPhone.trim() || null,
      sponsorCoverage: values.sponsorCoverage.trim() || null,
    };

    this.saving.set(true);

    this.catService
      .create(request)
      .pipe(
        switchMap((created) => this.uploadPendingPhotos(created.id)),
        finalize(() => this.saving.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (failedCount) => {
          if (failedCount === 0) {
            void this.router.navigate(['/']);
            return;
          }
          this.saveError.set(
            `O gato foi salvo, mas ${failedCount} de ${this.pendingPhotos().length} foto(s) não foram enviadas. Tente adicioná-las depois.`,
          );
          this.pendingPhotos.set([]);
          this.pendingPhotoUrls.set([]);
        },
        error: (error: HttpErrorResponse) => this.handleSaveError(error),
      });
  }

  private uploadPendingPhotos(catId: number) {
    const photos = this.pendingPhotos();
    if (photos.length === 0) {
      return of(0);
    }

    return forkJoin(
      photos.map((file) =>
        this.catService.uploadPhoto(catId, file).pipe(
          map(() => true),
          catchError(() => of(false)),
        ),
      ),
    ).pipe(map((results) => results.filter((success) => !success).length));
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
      this.saveError.set('Você não tem permissão para cadastrar gatos.');
    } else if (error.status === 404) {
      this.saveError.set('A sala selecionada não existe mais. Escolha outra.');
    } else if (error.status === 400) {
      this.saveError.set('Confira os dados informados e tente novamente.');
    } else {
      this.saveError.set('Não foi possível salvar o gato. Tente novamente.');
    }
  }
}
