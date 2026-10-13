import type { CreateStockEntryRequest } from '../types/stock';
import type { OutboxService } from '../sync/outbox';
import type { SyncStore } from '../sync/store';

export interface StockRepositoryDeps {
  store: SyncStore;
  outbox: OutboxService;
}

export function createStockRepository(deps: StockRepositoryDeps) {
  const { store, outbox } = deps;

  async function createStockEntry(
    userId: number,
    itemName: string,
    request: CreateStockEntryRequest,
  ): Promise<void> {
    await store.transaction(async (ops) => {
      await outbox.enqueueWithin(
        ops,
        'CREATE_STOCK_ENTRY',
        userId,
        {
          itemName,
          request,
        },
      );
    });

    outbox.notifyEnqueued();
  }

  return {
    createStockEntry,
  };
}

export type StockRepository = ReturnType<typeof createStockRepository>;
