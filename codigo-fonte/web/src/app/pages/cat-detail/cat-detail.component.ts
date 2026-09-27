import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { CatCoverComponent } from '../../components/cat-cover/cat-cover.component';
import {
  Cat,
  GENERAL_STATUS_LABELS,
  NEUTERING_STATUS_LABELS,
  PIF_RESULT_LABELS,
  SEX_LABELS,
} from '../../models/cat.model';
import { CatService } from '../../services/resources/cat.service';

type ExamTone = 'positive' | 'negative' | 'not-tested';

@Component({
  selector: 'app-cat-detail',
  standalone: true,
  imports: [CatCoverComponent, RouterLink],
  templateUrl: './cat-detail.component.html',
  styleUrl: './cat-detail.component.css',
})
export class CatDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly catService = inject(CatService);

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly cat = signal<Cat | null>(null);

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
        next: (cat) => this.cat.set(cat),
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
    if (!cat.estimatedBirthDate) {
      return '—';
    }

    // Built from the y/m/d parts rather than `new Date(isoDate)`: a date-only ISO string
    // parses as UTC midnight, which rolls back to the previous local day west of UTC and
    // silently throws the year-boundary comparison below off by one.
    const [year, month, day] = cat.estimatedBirthDate.split('-').map(Number);
    const birthDate = new Date(year, month - 1, day);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const hadBirthdayThisYear =
      today.getMonth() > birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() &&
        today.getDate() >= birthDate.getDate());

    if (!hadBirthdayThisYear) {
      age -= 1;
    }

    age = Math.max(age, 0);
    return `${age} ${age === 1 ? 'ano' : 'anos'}`;
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
    if (cat.healthStatus === 'NotTested') return 'Não testado';
    return cat.healthStatus === 'Fiv' || cat.healthStatus === 'FivFelv' ? 'Positivo' : 'Negativo';
  }

  fivTone(cat: Cat): ExamTone {
    if (cat.healthStatus === 'NotTested') return 'not-tested';
    return cat.healthStatus === 'Fiv' || cat.healthStatus === 'FivFelv' ? 'positive' : 'negative';
  }

  felvLabel(cat: Cat): string {
    if (cat.healthStatus === 'NotTested') return 'Não testado';
    return cat.healthStatus === 'Felv' || cat.healthStatus === 'FivFelv' ? 'Positivo' : 'Negativo';
  }

  felvTone(cat: Cat): ExamTone {
    if (cat.healthStatus === 'NotTested') return 'not-tested';
    return cat.healthStatus === 'Felv' || cat.healthStatus === 'FivFelv' ? 'positive' : 'negative';
  }

  pifLabel(cat: Cat): string {
    return PIF_RESULT_LABELS[cat.pifResult];
  }

  pifTone(cat: Cat): ExamTone {
    if (cat.pifResult === 'NotTested') return 'not-tested';
    return cat.pifResult === 'Positive' ? 'positive' : 'negative';
  }

  createdAtLabel(cat: Cat): string {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(cat.createdAt));
  }
}
