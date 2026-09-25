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

import { RoomService } from '../../services/resources/room.service';

@Component({
  selector: 'app-room-cover',
  standalone: true,
  imports: [],
  templateUrl: './room-cover.component.html',
  styleUrl: './room-cover.component.css',
})
export class RoomCoverComponent implements OnChanges, OnDestroy {
  private readonly roomService = inject(RoomService);
  private subscription?: Subscription;

  @Input() roomId: number | null = null;
  @Input() hasPhoto = false;
  @Input() version = 0;
  @Input() previewUrl: string | null = null;

  readonly photoUrl = signal<string | null>(null);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['roomId'] || changes['hasPhoto'] || changes['version']) {
      this.loadPhoto();
    }
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.release();
  }

  private loadPhoto(): void {
    this.subscription?.unsubscribe();

    if (!this.hasPhoto || this.roomId === null) {
      this.release();
      return;
    }

    this.subscription = this.roomService.photo(this.roomId).subscribe({
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
