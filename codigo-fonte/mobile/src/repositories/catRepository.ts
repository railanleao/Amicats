import type { OutboxService } from '../sync/outbox';
import type { SyncStore } from '../sync/store';
import type { Cat, CreateCatRequest, GeneralStatus } from '../types/cat';
import type { Room } from '../types/room';

export interface CatListParams {
  search?: string;
  generalStatus?: GeneralStatus;
}

export interface CatRepositoryDeps {
  store: SyncStore;
  outbox: OutboxService;
  now: () => Date;
  fetchRemoteCat: (catId: number) => Promise<Cat>;
}

function matchesSearch(cat: Cat, term: string): boolean {
  return cat.name.toLowerCase().includes(term) || (cat.microchip ?? '').toLowerCase().includes(term);
}

export function createCatRepository(deps: CatRepositoryDeps) {
  const { store, outbox } = deps;

  async function listCats(params: CatListParams = {}): Promise<Cat[]> {
    const cats = await store.run((ops) => ops.listEntities<Cat>('cat'));
    const term = params.search?.trim().toLowerCase();

    return cats
      .filter((cat) => !params.generalStatus || cat.generalStatus === params.generalStatus)
      .filter((cat) => !term || matchesSearch(cat, term))
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  }

  async function getCat(catId: number): Promise<Cat | null> {
    const cached = await store.run((ops) => ops.getEntity<Cat>('cat', catId));

    if (cached) {
      return cached;
    }

    if (catId < 0) {
      return store.run(async (ops) => {
        const serverId = await ops.resolveId(catId);
        return serverId === null ? null : ops.getEntity<Cat>('cat', serverId);
      });
    }

    const remote = await deps.fetchRemoteCat(catId);
    await store.run((ops) => ops.upsertEntity('cat', remote.id, remote));

    return remote;
  }

  async function listActiveRooms(): Promise<Room[]> {
    const rooms = await store.run((ops) => ops.listEntities<Room>('room'));

    return rooms.filter((room) => room.active).sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'));
  }

  async function createCat(userId: number, request: CreateCatRequest, photoUri?: string): Promise<Cat> {
    const cat = await store.transaction(async (ops) => {
      const localId = await ops.allocateLocalId();
      const rooms = await ops.listEntities<Room>('room');
      const room = rooms.find((candidate) => candidate.id === request.roomId);

      const optimistic: Cat = {
        ...request,
        id: localId,
        generalStatus: request.generalStatus ?? 'InTriage',
        photoUrl: null,
        roomTitle: room?.title ?? null,
        healthStatus: 'NotTested',
        pifResult: 'NotTested',
        neuteringStatus: null,
        createdAt: deps.now().toISOString(),
      };

      await ops.upsertEntity('cat', localId, optimistic);
      await outbox.enqueueWithin(ops, 'CREATE_CAT', userId, { localId, request });

      if (photoUri) {
        await outbox.enqueueWithin(ops, 'UPLOAD_CAT_PHOTO', userId, {
          catId: localId,
          catName: request.name,
          fileUri: photoUri,
        });
      }

      return optimistic;
    });

    outbox.notifyEnqueued();

    return cat;
  }

  async function cacheCat(cat: Cat): Promise<void> {
    await store.run((ops) => ops.upsertEntity('cat', cat.id, cat));
  }

  return { listCats, getCat, listActiveRooms, createCat, cacheCat };
}

export type CatRepository = ReturnType<typeof createCatRepository>;
