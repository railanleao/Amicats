import {
  Component,
  DestroyRef,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, interval } from 'rxjs';

import {
  StatusBadgeComponent,
  StatusBadgeTone,
} from '../../components/status-badge/status-badge.component';
import { formatRelativeTime } from '../../lib/relative-time';
import { ACCESS_TYPE_LABELS } from '../../models/user.model';
import { SyncDevice } from '../../models/sync.model';
import { SyncService } from '../../services/resources/sync.service';

const REFRESH_INTERVAL_MS = 60_000;

interface StatusView {
  label: string;
  tone: StatusBadgeTone;
}

@Component({
  selector: 'app-sync',
  standalone: true,
  imports: [StatusBadgeComponent],
  templateUrl: './sync.component.html',
  styleUrl: './sync.component.css',
})
export class SyncComponent implements OnInit {
  private readonly syncService = inject(SyncService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly devices = signal<SyncDevice[]>([]);
  readonly checkedAt = signal<string | null>(null);
  readonly searchTerm = signal('');

  readonly filteredDevices = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();

    if (!term) {
      return this.devices();
    }

    return this.devices().filter((device) =>
      [device.deviceName, device.platform, device.userName]
        .filter((value): value is string => !!value)
        .some((value) => value.toLowerCase().includes(term)),
    );
  });

  ngOnInit(): void {
    this.loadDevices();

    interval(REFRESH_INTERVAL_MS)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadDevices());
  }

  loadDevices(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.syncService
      .listDevices()
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (devices) => {
          this.devices.set(devices);
          this.checkedAt.set(new Date().toISOString());
        },
        error: () =>
          this.errorMessage.set(
            'Não foi possível carregar os dispositivos. Tente novamente.',
          ),
      });
  }

  onSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  deviceTitle(device: SyncDevice): string {
    return device.deviceName ?? device.platform ?? 'Dispositivo';
  }

  profileLabel(device: SyncDevice): string {
    const label = ACCESS_TYPE_LABELS[device.accessType];

    return device.userActive ? label : `${label} (inativo)`;
  }

  lastSyncLabel(device: SyncDevice): string {
    return formatRelativeTime(device.lastSyncAt);
  }

  checkedAtLabel(): string {
    return formatRelativeTime(this.checkedAt());
  }

  pendingLabel(device: SyncDevice): string {
    return device.rejectedCount > 0
      ? `${device.pendingCount} · ${device.rejectedCount} recusado(s)`
      : String(device.pendingCount);
  }

  statusView(device: SyncDevice): StatusView {
    if (device.rejectedCount > 0) {
      return { label: 'Com recusas', tone: 'danger' };
    }

    return device.status === 'Pending'
      ? { label: 'Pendente', tone: 'warning' }
      : { label: 'Sincronizado', tone: 'success' };
  }
}
