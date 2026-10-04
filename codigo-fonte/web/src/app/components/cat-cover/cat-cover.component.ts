import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  inject,
  signal,
} from '@angular/core';
import { Subscription } from 'rxjs';

import { CatService } from '../../services/resources/cat.service';

@Component({
  selector: 'app-cat-cover',
  standalone: true,
  imports: [],
  templateUrl: './cat-cover.component.html',
  styleUrl: './cat-cover.component.css',
})
export class CatCoverComponent implements OnChanges, OnDestroy {
  private readonly catService = inject(CatService);
  private subscription?: Subscription;

  @Input() catId: number | null = null;
  @Input() hasPhoto = false;
  @Input() version = 0;
  @Input() previewUrl: string | null = null;

  readonly photoUrl = signal<string | null>(null);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['catId'] || changes['hasPhoto'] || changes['version']) {
      this.loadPhoto();
    }
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.release();
  }

  private loadPhoto(): void {
    this.subscription?.unsubscribe();

    if (!this.hasPhoto || this.catId === null) {
      this.release();
      return;
    }

    this.subscription = this.catService.photo(this.catId).subscribe({
      next: (blob) => {
        this.release();
        this.photoUrl.set(URL.createObjectURL(blob));
      },
      error: () => this.release(),
    });
  }

  private release(): void {
    const url = this.photoUrl();
    if (url) {
      URL.revokeObjectURL(url);
    }
    this.photoUrl.set(null);
  }
}
