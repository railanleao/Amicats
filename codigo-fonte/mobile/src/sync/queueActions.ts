import { OPERATIONS } from './operations';
import type { OperationDefinition } from './operations';
import type { SyncStore } from './store';

export async function discardOperation(store: SyncStore, id: string): Promise<void> {
  await store.transaction(async (ops) => {
    const item = await ops.getOutbox(id);

    if (!item) {
      return;
    }

    const definition = OPERATIONS[item.type] as OperationDefinition<unknown>;
    await definition.onDiscard?.(item.payload, ops);
    await ops.deleteOutbox(id);
  });
}

export async function retryOperation(store: SyncStore, id: string): Promise<void> {
  await store.run((ops) => ops.requeue(id));
}
