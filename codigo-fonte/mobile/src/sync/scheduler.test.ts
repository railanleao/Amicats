import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { SyncEngine } from './engine';
import { SyncScheduler } from './scheduler';
import type { BlockedBy, SyncResult } from './types';

function result(blockedBy: BlockedBy): SyncResult {
  return { skipped: false, pushed: 0, rejected: 0, pulled: blockedBy === null, blockedBy };
}

function setup(outcomes: BlockedBy[]) {
  let nowMs = 1_000_000;
  let online = true;
  let calls = 0;

  const engine = {
    syncNow: async () => result(outcomes[Math.min(calls++, outcomes.length - 1)]),
  } as unknown as SyncEngine;

  const scheduler = new SyncScheduler({
    engine,
    checkOnline: async () => online,
    now: () => nowMs,
    random: () => 1,
  });

  return {
    scheduler,
    calls: () => calls,
    advance: (ms: number) => {
      nowMs += ms;
    },
    setOnline: (value: boolean) => {
      online = value;
    },
  };
}

describe('SyncScheduler', () => {
  it('skips automatic triggers while offline', async () => {
    const t = setup([null]);
    t.setOnline(false);

    assert.equal(await t.scheduler.request('interval'), null);
    assert.equal(t.calls(), 0);
  });

  it('reports a network block for manual requests while offline', async () => {
    const t = setup([null]);
    t.setOnline(false);

    const manual = await t.scheduler.request('manual');

    assert.equal(manual?.blockedBy, 'network');
    assert.equal(t.calls(), 0);
  });

  it('backs off exponentially after network failures and lets manual requests through', async () => {
    const t = setup(['network', 'network', null]);

    await t.scheduler.request('reconnect');
    assert.equal(t.scheduler.backoffRemainingMs(), 5_000);
    assert.equal(await t.scheduler.request('interval'), null);
    assert.equal(t.calls(), 1);

    t.advance(5_000);
    await t.scheduler.request('interval');
    assert.equal(t.scheduler.backoffRemainingMs(), 10_000);

    const manual = await t.scheduler.request('manual');
    assert.equal(manual?.blockedBy, null);
    assert.equal(t.scheduler.backoffRemainingMs(), 0);
    assert.equal(t.calls(), 3);
  });

  it('lets app open and reconnect triggers through during a backoff', async () => {
    const t = setup(['network', null, null]);

    await t.scheduler.request('interval');
    assert.ok(t.scheduler.backoffRemainingMs() > 0);

    const foreground = await t.scheduler.request('foreground');
    assert.equal(foreground?.blockedBy, null);
    assert.equal(t.calls(), 2);

    const reconnect = await t.scheduler.request('reconnect');
    assert.equal(reconnect?.blockedBy, null);
    assert.equal(t.calls(), 3);
  });

  it('reports the connectivity outcome of every request to subscribers', async () => {
    const t = setup(['network', null]);
    const seen: boolean[] = [];
    t.scheduler.subscribe((online) => seen.push(online));

    await t.scheduler.request('foreground');
    await t.scheduler.request('foreground');
    t.setOnline(false);
    await t.scheduler.request('foreground');

    assert.deepEqual(seen, [false, true, false]);
  });

  it('caps the backoff at five minutes', async () => {
    const t = setup(['server']);

    for (let attempt = 0; attempt < 12; attempt += 1) {
      t.advance(10 * 60_000);
      await t.scheduler.request('interval');
    }

    assert.equal(t.scheduler.backoffRemainingMs(), 5 * 60_000);
  });

  it('does not back off for rejected operations or auth errors', async () => {
    const t = setup(['unauthorized']);

    await t.scheduler.request('foreground');

    assert.equal(t.scheduler.backoffRemainingMs(), 0);
  });
});
