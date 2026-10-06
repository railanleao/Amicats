import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { AppState } from 'react-native';
import { describeOperation } from './operations';
import { discardOperation, retryOperation } from './queueActions';
import { checkOnline, lastConnectivityIssue, subscribeToConnectivity } from './connectivity';
import { nextSyncDelayMs } from './timing';
import { setSyncUser, syncEngine, syncScheduler, syncStore } from './runtime';
import type { OutboxStatus } from './types';

const OPEN_RETRY_ATTEMPTS = 4;
const OPEN_RETRY_DELAY_MS = 4_000;

export interface QueueItem {
  id: string;
  label: string;
  recordedAt: string;
  status: OutboxStatus;
  error: string | null;
}

interface Snapshot {
  syncing: boolean;
  pending: number;
  rejected: number;
  lastSyncAt: string | null;
  lastError: string | null;
  items: QueueItem[];
}

async function loadSnapshot(userId: number | null): Promise<Snapshot> {
  if (userId === null) {
    return { syncing: false, pending: 0, rejected: 0, lastSyncAt: null, lastError: null, items: [] };
  }

  const snapshot = await syncEngine.snapshot();
  const outbox = await syncStore.run((ops) => ops.listOutbox(userId));

  return {
    syncing: snapshot.syncing,
    pending: snapshot.pending,
    rejected: snapshot.rejected,
    lastSyncAt: snapshot.lastSyncAt,
    lastError: snapshot.lastError,
    items: outbox.map((item) => ({
      id: item.id,
      label: describeOperation(item.type, item.payload),
      recordedAt: item.recordedAt,
      status: item.status,
      error: item.lastError,
    })),
  };
}

interface SyncContextValue {
  userId: number | null;
  online: boolean;
  syncing: boolean;
  pending: number;
  rejected: number;
  lastSyncAt: string | null;
  diagnostic: string | null;
  items: QueueItem[];
  dataVersion: number;
  syncNow: () => Promise<void>;
  discard: (id: string) => Promise<void>;
  retry: (id: string) => Promise<void>;
}

const EMPTY: SyncContextValue = {
  userId: null,
  online: true,
  syncing: false,
  pending: 0,
  rejected: 0,
  lastSyncAt: null,
  diagnostic: null,
  items: [],
  dataVersion: 0,
  syncNow: async () => undefined,
  discard: async () => undefined,
  retry: async () => undefined,
};

const SyncContext = createContext<SyncContextValue>(EMPTY);

export function useSync(): SyncContextValue {
  return useContext(SyncContext);
}

interface SyncProviderProps {
  userId: number | null;
  children: ReactNode;
}

export function SyncProvider({ userId, children }: SyncProviderProps) {
  const [online, setOnline] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [pending, setPending] = useState(0);
  const [rejected, setRejected] = useState(0);
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const [connectivityIssue, setConnectivityIssue] = useState<string | null>(null);
  const [items, setItems] = useState<QueueItem[]>([]);
  const [dataVersion, setDataVersion] = useState(0);

  const applySnapshot = useCallback((snapshot: Snapshot) => {
    setSyncing(snapshot.syncing);
    setPending(snapshot.pending);
    setRejected(snapshot.rejected);
    setLastSyncAt(snapshot.lastSyncAt);
    setLastError(snapshot.lastError);
    setItems(snapshot.items);
    setDataVersion((version) => version + 1);
  }, []);

  const refresh = useCallback(() => loadSnapshot(userId).then(applySnapshot), [userId, applySnapshot]);

  useEffect(() => {
    setSyncUser(userId);
    void refresh();

    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;

    async function syncOnOpen(attempt: number) {
      const result = await syncScheduler.request('foreground');

      if (!cancelled && result === null && attempt < OPEN_RETRY_ATTEMPTS) {
        retryTimer = setTimeout(() => void syncOnOpen(attempt + 1), OPEN_RETRY_DELAY_MS);
      }
    }

    if (userId !== null) {
      void syncOnOpen(1);
    }

    return () => {
      cancelled = true;
      clearTimeout(retryTimer);
      setSyncUser(null);
    };
  }, [userId, refresh]);

  useEffect(() => syncEngine.subscribe(() => void refresh()), [refresh]);

  useEffect(
    () =>
      syncScheduler.subscribe((connected) => {
        setOnline(connected);
        setConnectivityIssue(connected ? null : lastConnectivityIssue());
      }),
    [],
  );

  useEffect(() => {
    void checkOnline().then((connected) => {
      setOnline(connected);
      setConnectivityIssue(connected ? null : lastConnectivityIssue());
    });

    return subscribeToConnectivity((connected) => {
      setOnline(connected);
      setConnectivityIssue(connected ? null : lastConnectivityIssue());

      if (connected) {
        void syncScheduler.request('reconnect');
      }
    });
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void syncScheduler.request('foreground');
      }
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (userId === null) {
      return;
    }

    let timer: ReturnType<typeof setTimeout> | undefined;
    let stopped = false;

    function schedule() {
      timer = setTimeout(() => {
        if (stopped) {
          return;
        }

        if (AppState.currentState === 'active') {
          void syncScheduler.request('interval');
        }

        schedule();
      }, nextSyncDelayMs(Math.random()));
    }

    schedule();

    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [userId]);

  const syncNow = useCallback(async () => {
    try {
      const result = await syncScheduler.request('manual');
      const connected = result === null || result.blockedBy !== 'network';
      setOnline(connected);
      setConnectivityIssue(connected ? null : lastConnectivityIssue());
    } catch (error) {
      setConnectivityIssue(`Erro inesperado na sincronização: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, []);

  const discard = useCallback(async (id: string) => {
    await discardOperation(syncStore, id);
    syncEngine.notifyChanged();
  }, []);

  const retry = useCallback(async (id: string) => {
    await retryOperation(syncStore, id);
    syncEngine.notifyChanged();
    await syncScheduler.request('manual');
  }, []);

  const value = useMemo<SyncContextValue>(
    () => ({
      userId,
      online,
      syncing,
      pending,
      rejected,
      lastSyncAt,
      diagnostic: online ? lastError : (connectivityIssue ?? lastError),
      items,
      dataVersion,
      syncNow,
      discard,
      retry,
    }),
    [userId, online, syncing, pending, rejected, lastSyncAt, lastError, connectivityIssue, items, dataVersion, syncNow, discard, retry],
  );

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
}
