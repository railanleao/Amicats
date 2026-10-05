import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { CatAvatarComponent } from '../../components/cat-avatar/cat-avatar.component';
import {
  AGE_GROUP_LABELS,
  Cat,
  HEALTH_STATUS_LABELS,
  SEX_LABELS,
} from '../../models/cat.model';
import { CatService } from '../../services/resources/cat.service';

type TestTag = 'positive' | 'negative' | 'not-tested';

@Component({
  selector: 'app-medical-record-detail',
  standalone: true,
  imports: [RouterLink, CatAvatarComponent],
  templateUrl: './medical-record-detail.component.html',
  styleUrl: './medical-record-detail.component.css',
})
export class MedicalRecordDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly catService = inject(CatService);
  private readonly destroyRef = inject(DestroyRef);

  readonly catId = Number(this.route.snapshot.paramMap.get('id'));

  readonly cat = signal<Cat | null>(null);
  readonly loading = signal(false);
  readonly loadError = signal<string | null>(null);

  constructor() {
    this.loadCat();
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

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onNewPrescription(): void {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onRegisterExternalVisit(): void {}

  private loadCat(): void {
    if (!Number.isInteger(this.catId)) {
      this.loadError.set('Gatinho não encontrado.');
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
        next: (cat) => this.cat.set(cat),
        error: (error: HttpErrorResponse) =>
          this.loadError.set(
            error.status === 404
              ? 'Gatinho não encontrado.'
              : 'Não foi possível carregar o prontuário. Tente novamente.',
          ),
      });
  }
}
