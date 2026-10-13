import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { CatAvatarComponent } from '../../components/cat-avatar/cat-avatar.component';
import {
  felvResult,
  fivResult,
  neuteringLabel,
  TestTag,
  testTagLabel,
} from '../../lib/cat-health';
import {
  AGE_GROUP_LABELS,
  Cat,
  HEALTH_STATUS_LABELS,
  SEX_LABELS,
} from '../../models/cat.model';
import { PrescribedMedication } from '../../models/medical-prescription.model';
import { ExternalAttendance } from '../../models/external-attendance.model';
import { AuthService } from '../../services/resources/auth.service';
import { CatService } from '../../services/resources/cat.service';
import { PrescribedMedicationService } from '../../services/resources/prescribed-medication.service';
import { ExternalAttendanceService } from '../../services/resources/external-attendance.service';

interface PrescriptionNavigationState {
  prescriptionCreated?: boolean;
  stockWarning?: string | null;
}

@Component({
  selector: 'app-medical-record-detail',
  standalone: true,
  imports: [DatePipe, RouterLink, CatAvatarComponent],
  templateUrl: './medical-record-detail.component.html',
  styleUrl: './medical-record-detail.component.css',
})
export class MedicalRecordDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly catService = inject(CatService);
  private readonly prescribedMedicationService = inject(
    PrescribedMedicationService,
  );
  private readonly externalAttendanceService = inject(
    ExternalAttendanceService,
  );
  private readonly destroyRef = inject(DestroyRef);

  readonly catId = Number(this.route.snapshot.paramMap.get('id'));

  private readonly navigationState = this.readNavigationState();
  readonly prescriptionCreated =
    this.navigationState?.prescriptionCreated === true;
  readonly stockWarning: string | null =
    this.navigationState?.stockWarning ?? null;

  readonly cat = signal<Cat | null>(null);
  readonly loading = signal(false);
  readonly loadError = signal<string | null>(null);

  readonly activeMedications = signal<PrescribedMedication[]>([]);
  readonly activeMedicationsError = signal<string | null>(null);
  readonly externalAttendances = signal<ExternalAttendance[]>([]);
  readonly externalAttendancesError = signal<string | null>(null);
  readonly externalAttendanceDownloadError = signal<string | null>(null);

  readonly canPrescribe = computed(
    () => this.authService.currentUser()?.accessType === 'Veterinarian',
  );

  constructor() {
    if (!Number.isInteger(this.catId)) {
      this.loadError.set('Gatinho não encontrado.');
      return;
    }

    this.loadCat();
    this.loadActiveMedications();
    this.loadExternalAttendances();
  }

  get identityDetails(): string {
    const cat = this.cat();
    if (!cat) {
      return '';
    }
    return [
      cat.sex ? SEX_LABELS[cat.sex] : null,
      cat.ageGroup ? AGE_GROUP_LABELS[cat.ageGroup] : null,
      HEALTH_STATUS_LABELS[cat.healthStatus],
    ]
      .filter((part): part is string => !!part)
      .join(' · ');
  }

  get fivTag(): TestTag {
    return fivResult(this.cat()?.healthStatus);
  }

  get felvTag(): TestTag {
    return felvResult(this.cat()?.healthStatus);
  }

  get neuteredLabel(): string {
    return neuteringLabel(this.cat()?.neuteringStatus);
  }

  get weightLabel(): string {
    const weight = this.cat()?.weightKg;
    return weight != null ? `${weight} kg` : '—';
  }

  tagLabel(tag: TestTag): string {
    return testTagLabel(tag);
  }

  onNewPrescription(): void {
    void this.router.navigate([
      '/medical-records',
      this.catId,
      'internal-prescriptions',
      'new',
    ]);
  }

  onRegisterExternalVisit(): void {
    void this.router.navigate([
      '/medical-records',
      this.catId,
      'external-attendances',
      'new',
    ]);
  }

  private readNavigationState(): PrescriptionNavigationState | undefined {
    const navigation = this.router.getCurrentNavigation();
    if (
      !navigation ||
      navigation.trigger !== 'imperative' ||
      !navigation.previousNavigation
    ) {
      return undefined;
    }
    return navigation.extras.state as PrescriptionNavigationState | undefined;
  }

  private loadCat(): void {
    this.loading.set(true);

    this.catService
      .findById(this.catId)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (cat) => this.cat.set(cat),
        error: (error: HttpErrorResponse) =>
          this.loadError.set(
            error.status === 404
              ? 'Gatinho não encontrado.'
              : 'Não foi possível carregar o prontuário. Tente novamente.',
          ),
      });
  }

  openExternalAttachment(attendance: ExternalAttendance): void {
    this.externalAttendanceDownloadError.set(null);
    this.externalAttendanceService
      .attachment(attendance.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (blob) => {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = attendance.attachedFile || 'anexo-atendimento';
          link.click();
          URL.revokeObjectURL(url);
        },
        error: () =>
          this.externalAttendanceDownloadError.set(
            'Não foi possível abrir o anexo do atendimento externo.',
          ),
      });
  }

  private loadExternalAttendances(): void {
    this.externalAttendancesError.set(null);
    this.externalAttendanceService
      .listByCat(this.catId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (attendances) => this.externalAttendances.set(attendances),
        error: () =>
          this.externalAttendancesError.set(
            'Não foi possível carregar os atendimentos externos.',
          ),
      });
  }

  private loadActiveMedications(): void {
    this.prescribedMedicationService
      .listActive(this.catId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (medications) => this.activeMedications.set(medications),
        error: () =>
          this.activeMedicationsError.set(
            'Não foi possível carregar a medicação ativa.',
          ),
      });
  }
}
