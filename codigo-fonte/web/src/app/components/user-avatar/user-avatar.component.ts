import { Component, Input, OnChanges, OnDestroy, SimpleChanges, inject, signal } from '@angular/core';
import { Subscription } from 'rxjs';

import { UserService } from '../../services/resources/user.service';

@Component({
  selector: 'app-user-avatar',
  standalone: true,
  imports: [],
  templateUrl: './user-avatar.component.html',
  styleUrl: './user-avatar.component.css',
})
export class UserAvatarComponent implements OnChanges, OnDestroy {
  private readonly userService = inject(UserService);
  private subscription?: Subscription;

  @Input({ required: true }) name!: string;
  @Input() userId: number | null = null;
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
    if (changes['userId'] || changes['hasPhoto'] || changes['version']) {
      this.loadPhoto();
    }
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.release();
  }

  private loadPhoto(): void {
    this.subscription?.unsubscribe();

    if (!this.hasPhoto || this.userId === null) {
      this.release();
      return;
    }

    this.subscription = this.userService.photo(this.userId).subscribe({
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
