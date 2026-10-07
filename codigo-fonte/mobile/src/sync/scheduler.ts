import type { SyncEngine } from './engine';
import type { SyncResult } from './types';

export type SyncTrigger = 'manual' | 'enqueue' | 'reconnect' | 'foreground' | 'interval';

export interface SchedulerDeps {
  engine: SyncEngine;
  checkOnline: () => Promise<boolean>;
  now: () => number;
  random: () => number;
}

const BACKOFF_BYPASS_TRIGGERS: SyncTrigger[] = ['manual', 'foreground', 'reconnect'];

const BASE_BACKOFF_MS = 5_000;
const MAX_BACKOFF_MS = 5 * 60_000;

export class SyncScheduler {
  private failures = 0;
  private listeners = new Set<(online: boolean) => void>();
  private nextAllowedAt = 0;

  constructor(private readonly deps: SchedulerDeps) {}

  subscribe(listener: (online: boolean) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  async request(trigger: SyncTrigger): Promise<SyncResult | null> {
    const isManual = trigger === 'manual';

    if (!BACKOFF_BYPASS_TRIGGERS.includes(trigger) && this.deps.now() < this.nextAllowedAt) {
      return null;
    }

    if (!(await this.deps.checkOnline())) {
      this.emit(false);
      return isManual ? offlineResult() : null;
    }

    const result = await this.deps.engine.syncNow();
    this.track(result);
    this.emit(result.blockedBy !== 'network');

    return result;
  }

  backoffRemainingMs(): number {
    return Math.max(0, this.nextAllowedAt - this.deps.now());
  }

  private emit(online: boolean): void {
    this.listeners.forEach((listener) => listener(online));
  }

  private track(result: SyncResult): void {
    if (result.skipped) {
      return;
    }

    if (result.blockedBy === 'network' || result.blockedBy === 'server') {
      this.failures += 1;
      const ceiling = Math.min(BASE_BACKOFF_MS * 2 ** (this.failures - 1), MAX_BACKOFF_MS);
      this.nextAllowedAt = this.deps.now() + ceiling * (0.5 + this.deps.random() / 2);
      return;
    }

    this.failures = 0;
    this.nextAllowedAt = 0;
  }
}

function offlineResult(): SyncResult {
  return { skipped: false, pushed: 0, rejected: 0, pulled: false, blockedBy: 'network' };
}
