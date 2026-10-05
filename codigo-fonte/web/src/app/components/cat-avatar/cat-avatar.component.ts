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
  selector: 'app-cat-avatar',
  standalone: true,
  imports: [],
  templateUrl: './cat-avatar.component.html',
  styleUrl: './cat-avatar.component.css',
})
export class CatAvatarComponent implements OnChanges, OnDestroy {
  private readonly catService = inject(CatService);
  private subscription?: Subscription;

  @Input({ required: true }) name!: string;
  @Input() catId: number | null = null;
  @Input() hasPhoto = false;
  @Input() version = 0;
  @Input() size = 40;
  @Input() previewUrl: string | null = null;

  readonly photoUrl = signal<string | null>(null);

  get initials(): string {
    const parts = this.name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) {
      return '?';
    }
    const first = parts[0][0];
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase();
  }

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
