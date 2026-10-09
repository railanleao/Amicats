import { DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { CatCoverComponent } from '../../components/cat-cover/cat-cover.component';
import { formatAge } from '../../lib/cat-age';
import { felvResult, fivResult, testTagLabel } from '../../lib/cat-health';
import {
  canManageHealthProcedures,
  healthProcedureName,
} from '../../lib/health-procedure';
import {
  Cat,
  GENERAL_STATUS_LABELS,
  NEUTERING_STATUS_LABELS,
  PIF_RESULT_LABELS,
  SEX_LABELS,
} from '../../models/cat.model';
import { CatHealthSummary } from '../../models/health-procedure.model';
import { AuthService } from '../../services/resources/auth.service';
import { CatService } from '../../services/resources/cat.service';
import { HealthProcedureService } from '../../services/resources/health-procedure.service';
import { parseServerDateTime } from '../../lib/server-date';

type ExamTone = 'positive' | 'negative' | 'not-tested';

@Component({
  selector: 'app-cat-detail',
  standalone: true,
  imports: [CatCoverComponent, DatePipe, RouterLink],
  templateUrl: './cat-detail.component.html',
  styleUrl: './cat-detail.component.css',
})
export class CatDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly catService = inject(CatService);
  private readonly healthProcedureService = inject(HealthProcedureService);
  private readonly authService = inject(AuthService);

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly cat = signal<Cat | null>(null);
  readonly healthSummary = signal<CatHealthSummary | null>(null);

  readonly canManageHealth = computed(() =>
    canManageHealthProcedures(this.authService.currentUser()?.accessType),
  );

  readonly procedureName = healthProcedureName;

  ngOnInit(): void {
    this.loadCat();
  }

  loadCat(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.loading.set(true);
    this.errorMessage.set(null);

    this.catService
      .findById(id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (cat) => {
          this.cat.set(cat);
          this.loadHealthSummary(cat.id);
        },
        error: () =>
          this.errorMessage.set(
            'Não foi possível carregar a ficha do gato. Tente novamente.',
          ),
      });
  }

  sexLabel(cat: Cat): string {
    return cat.sex ? SEX_LABELS[cat.sex] : '—';
  }

  ageLabel(cat: Cat): string {
    return formatAge(cat.estimatedBirthDate) ?? '—';
  }

  roomLabel(cat: Cat): string {
    if (cat.roomTitle) {
      return cat.roomTitle;
    }
    return cat.generalStatus === 'TemporaryHome' ? 'Lar temporário' : '—';
  }

  generalStatusLabel(cat: Cat): string {
    return GENERAL_STATUS_LABELS[cat.generalStatus];
  }

  neuteringLabel(cat: Cat): string {
    return cat.neuteringStatus
      ? NEUTERING_STATUS_LABELS[cat.neuteringStatus]
      : 'Não informado';
  }

  // The backend tracks FIV and FeLV as one combined result (healthStatus), not two
  // independent exams — split it back out into the two rows the design shows.
  fivLabel(cat: Cat): string {
    return testTagLabel(fivResult(cat.healthStatus));
  }

  fivTone(cat: Cat): ExamTone {
    return fivResult(cat.healthStatus);
  }

  felvLabel(cat: Cat): string {
    return testTagLabel(felvResult(cat.healthStatus));
  }

  felvTone(cat: Cat): ExamTone {
    return felvResult(cat.healthStatus);
  }

  pifLabel(cat: Cat): string {
    return PIF_RESULT_LABELS[cat.pifResult];
  }

  pifTone(cat: Cat): ExamTone {
    if (cat.pifResult === 'NotTested') return 'not-tested';
    return cat.pifResult === 'Positive' ? 'positive' : 'negative';
  }

  createdAtLabel(cat: Cat): string {
    return new Intl.DateTimeFormat('pt-BR').format(
      parseServerDateTime(cat.createdAt),
    );
  }

  private loadHealthSummary(catId: number): void {
    this.healthProcedureService.summarize(catId).subscribe({
      next: (summary) => this.healthSummary.set(summary),
      error: () => this.healthSummary.set(null),
    });
  }
}
