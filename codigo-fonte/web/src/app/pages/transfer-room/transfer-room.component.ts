import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable, catchError, forkJoin, map, of, switchMap } from 'rxjs';

import { SubmitButtonComponent } from '../../components/submit-button/submit-button.component';
import { formatAge } from '../../lib/cat-age';
import { felvResult, fivResult, isNeutered } from '../../lib/cat-health';
import { transferDateTimeLabel, transferFromLabel } from '../../lib/room-transfer-format';
import { Cat, HEALTH_STATUS_LABELS, SEX_LABELS } from '../../models/cat.model';
import { Room } from '../../models/room.model';
import { RoomTransfer } from '../../models/room-transfer.model';
import { CatService } from '../../services/resources/cat.service';
import { RoomService } from '../../services/resources/room.service';
import { RoomTransferService } from '../../services/resources/room-transfer.service';

interface CurrentRoomInfo {
  title: string;
  description: string | null;
  occupied: number;
  capacity: number | null;
}

interface RoomOption {
  id: number;
  title: string;
  occupied: number;
  capacity: number;
}

@Component({
  selector: 'app-transfer-room',
  standalone: true,
  imports: [FormsModule, RouterLink, SubmitButtonComponent],
  templateUrl: './transfer-room.component.html',
  styleUrl: './transfer-room.component.css',
})
export class TransferRoomComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly catService = inject(CatService);
  private readonly roomService = inject(RoomService);
  private readonly roomTransferService = inject(RoomTransferService);

  readonly catId = Number(this.route.snapshot.paramMap.get('id'));

  readonly loading = signal(true);
  readonly loadError = signal<string | null>(null);
  readonly cat = signal<Cat | null>(null);

  readonly roomsLoading = signal(true);
  readonly roomsError = signal<string | null>(null);
  readonly currentRoomInfo = signal<CurrentRoomInfo | null>(null);
  readonly otherRooms = signal<RoomOption[]>([]);

  readonly transferHistory = signal<RoomTransfer[]>([]);

  readonly selectedRoomId = signal<number | null>(null);
  reason = '';
  readonly submitting = signal(false);
  readonly submitError = signal<string | null>(null);

  ngOnInit(): void {
    this.catService.findById(this.catId).subscribe({
      next: (cat) => {
        this.cat.set(cat);
        this.loading.set(false);
        this.loadRoomsData(cat);
      },
      error: () => {
        this.loadError.set('Não foi possível carregar a ficha do gato.');
        this.loading.set(false);
      },
    });

    this.roomTransferService.list(this.catId).subscribe({
      next: (transfers) => this.transferHistory.set(transfers),
      error: () => this.transferHistory.set([]),
    });
  }

  get canSubmit(): boolean {
    return this.selectedRoomId() !== null && this.reason.trim().length > 0;
  }

  get catSummary(): string {
    const cat = this.cat();
    if (!cat) {
      return '';
    }
    return [cat.sex ? SEX_LABELS[cat.sex] : null, formatAge(cat.estimatedBirthDate), cat.roomTitle]
      .filter((part): part is string => !!part)
      .join(' · ');
  }

  get healthTag(): string | null {
    const status = this.cat()?.healthStatus;
    const positive = fivResult(status) === 'positive' || felvResult(status) === 'positive';
    return status && positive ? HEALTH_STATUS_LABELS[status] : null;
  }

  get neuteredTag(): string | null {
    const cat = this.cat();
    if (!cat || !isNeutered(cat.neuteringStatus)) {
      return null;
    }
    return cat.sex === 'Male' ? 'Castrado' : 'Castrada';
  }

  readonly transferDateTimeLabel = transferDateTimeLabel;
  readonly transferFromLabel = transferFromLabel;

  selectRoom(roomId: number): void {
    this.selectedRoomId.set(roomId);
  }

  confirmTransfer(): void {
    const cat = this.cat();
    const roomId = this.selectedRoomId();
    const reason = this.reason.trim();
    if (!cat || roomId === null || !reason) {
      return;
    }

    this.submitError.set(null);
    this.submitting.set(true);

    this.roomTransferService.create(cat.id, { roomId, reason }).subscribe({
      next: () => this.router.navigate(['/cats', cat.id]),
      error: (error: HttpErrorResponse) => {
        this.submitError.set(this.transferErrorMessage(error));
        this.submitting.set(false);
      },
    });
  }

  // 400 here is always a specific business-rule violation (same room, sala lotada) with a
  // message worth showing as-is; everything else gets a fixed status-based message, matching
  // the pattern already used by cat-form's handleSaveError.
  private transferErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 400 && typeof error.error?.message === 'string') {
      return error.error.message;
    }
    if (error.status === 403) {
      return 'Você não tem permissão para transferir gatinhos de sala.';
    }
    return 'Não foi possível transferir o gato. Tente novamente.';
  }

  private loadRoomsData(cat: Cat): void {
    this.roomsLoading.set(true);
    this.roomsError.set(null);

    this.roomService
      .list({ active: true, page: 0, size: 100 })
      .pipe(
        switchMap((page) => {
          const rooms = page.content;
          const current = cat.roomId != null ? (rooms.find((room) => room.id === cat.roomId) ?? null) : null;
          const others = rooms.filter((room) => room.id !== cat.roomId && (room.maxCapacity ?? 0) > 0);

          return this.occupancyByRoomId([...(current ? [current] : []), ...others]).pipe(
            map((occupancyByRoomId) => ({ current, others, occupancyByRoomId })),
          );
        }),
        catchError(() => {
          this.roomsError.set('Não foi possível carregar as salas.');
          return of(null);
        }),
      )
      .subscribe((result) => {
        this.roomsLoading.set(false);
        if (!result) {
          return;
        }

        const { current, others, occupancyByRoomId } = result;

        if (current) {
          this.currentRoomInfo.set({
            title: current.title,
            description: current.description,
            occupied: occupancyByRoomId.get(current.id) ?? 0,
            capacity: current.maxCapacity,
          });
        }

        this.otherRooms.set(
          others.map((room) => ({
            id: room.id,
            title: room.title,
            occupied: occupancyByRoomId.get(room.id) ?? 0,
            capacity: room.maxCapacity as number,
          })),
        );
      });
  }

  private occupancyByRoomId(rooms: Room[]): Observable<Map<number, number>> {
    if (rooms.length === 0) {
      return of(new Map());
    }

    return forkJoin(
      rooms.map((room) =>
        this.catService.list({ roomId: room.id, page: 0, size: 1 }).pipe(
          map((page) => page.totalElements),
          catchError(() => of(0)),
          map((occupied) => [room.id, occupied] as const),
        ),
      ),
    ).pipe(map((pairs) => new Map(pairs)));
  }
}
