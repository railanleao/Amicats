import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { CatAvatarComponent } from '../../components/cat-avatar/cat-avatar.component';
import {
  AGE_GROUP_LABELS,
  Cat,
  HEALTH_STATUS_LABELS,
  SEX_LABELS,
} from '../../models/cat.model';
import { PrescribedMedication } from '../../models/medical-prescription.model';
import { AuthService } from '../../services/resources/auth.service';
import { CatService } from '../../services/resources/cat.service';
import { PrescribedMedicationService } from '../../services/resources/prescribed-medication.service';

type TestTag = 'positive' | 'negative' | 'not-tested';

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
  private readonly destroyRef = inject(DestroyRef);

  readonly catId = Number(this.route.snapshot.paramMap.get('id'));
  readonly prescriptionCreated = history.state?.prescriptionCreated === true;
  readonly stockWarning: string | null = history.state?.stockWarning ?? null;

  readonly cat = signal<Cat | null>(null);
  readonly loading = signal(false);
  readonly loadError = signal<string | null>(null);

  readonly activeMedications = signal<PrescribedMedication[]>([]);
  readonly activeMedicationsError = signal<string | null>(null);

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
    const status = this.cat()?.healthStatus;
    if (!status || status === 'NotTested') {
      return 'not-tested';
    }
    return status === 'Fiv' || status === 'FivFelv' ? 'positive' : 'negative';
  }

  get felvTag(): TestTag {
    const status = this.cat()?.healthStatus;
    if (!status || status === 'NotTested') {
      return 'not-tested';
    }
    return status === 'Felv' || status === 'FivFelv' ? 'positive' : 'negative';
  }

  get neuteredLabel(): string {
    switch (this.cat()?.neuteringStatus) {
      case 'Neutered':
        return 'Sim';
      case 'NotNeutered':
        return 'Não';
      case 'Scheduled':
        return 'Agendada';
      default:
        return '—';
    }
  }

  get weightLabel(): string {
    const weight = this.cat()?.weightKg;
    return weight != null ? `${weight} kg` : '—';
  }

  tagLabel(tag: TestTag): string {
    switch (tag) {
      case 'positive':
        return 'Positivo';
      case 'negative':
        return 'Negativo';
      default:
        return 'Não testado';
    }
  }

  onNewPrescription(): void {
    void this.router.navigate([
      '/medical-records',
      this.catId,
      'internal-prescriptions',
      'new',
    ]);
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onRegisterExternalVisit(): void {}

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
