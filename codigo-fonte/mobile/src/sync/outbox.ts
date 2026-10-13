import type { OperationPayloads } from './operations';
import type { StoreOps } from './store';
import type { OperationType } from './types';

export interface OutboxServiceDeps {
  uuid: () => string;
  now: () => Date;
  onEnqueued: () => void;
}

export class OutboxService {
  constructor(private readonly deps: OutboxServiceDeps) {}

  async enqueueWithin<T extends OperationType>(
    ops: StoreOps,
    type: T,
    authorUserId: number,
    payload: OperationPayloads[T],
  ): Promise<string> {
    const id = this.deps.uuid();
    const now = this.deps.now().toISOString();

    await ops.enqueue({
      id,
      type,
      authorUserId,
      payload,
      recordedAt: now,
      createdAt: now,
    });

    return id;
  }

  notifyEnqueued(): void {
    this.deps.onEnqueued();
  }
}
