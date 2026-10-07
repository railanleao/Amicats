export const SYNC_INTERVAL_MS = 120_000;
export const SYNC_INTERVAL_JITTER = 0.2;

export function nextSyncDelayMs(random: number): number {
  const spread = SYNC_INTERVAL_MS * SYNC_INTERVAL_JITTER;
  return Math.round(SYNC_INTERVAL_MS - spread + random * spread * 2);
}
