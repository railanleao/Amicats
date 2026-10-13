import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { RoomTransfer } from '../types/roomTransfer';
import {
  canSubmitTransfer,
  currentRoomSubtitle,
  occupancySubtitle,
  transferDateTimeLabel,
  transferErrorMessage,
  transferFromLabel,
} from './TransferRoomScreen.logic';

class FakeApiError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function aTransfer(overrides: Partial<RoomTransfer> = {}): RoomTransfer {
  return {
    id: 1,
    catId: 1,
    fromRoomId: 4,
    fromRoomTitle: 'Quarentena',
    toRoomId: 2,
    toRoomTitle: 'Observação Intensiva',
    reason: 'Alta clínica.',
    createdAt: '2025-12-12T09:00:00',
    ...overrides,
  };
}

describe('occupancySubtitle', () => {
  it('shows occupied/capacity when the room has a max capacity', () => {
    assert.equal(occupancySubtitle({ occupied: 1, capacity: 6 }), '1/6 ocupada');
  });

  it('falls back to a plain cat count when there is no max capacity', () => {
    assert.equal(occupancySubtitle({ occupied: 1, capacity: null }), '1 gato');
    assert.equal(occupancySubtitle({ occupied: 3, capacity: null }), '3 gatos');
  });
});

describe('currentRoomSubtitle', () => {
  it('combines occupancy with the room description when there is one', () => {
    assert.equal(
      currentRoomSubtitle({ title: 'Observação Intensiva', description: 'Enfermaria', occupied: 7, capacity: 8 }),
      '7/8 ocupada · Enfermaria',
    );
  });

  it('omits the description when the room has none', () => {
    assert.equal(
      currentRoomSubtitle({ title: 'Convivência Livre', description: null, occupied: 9, capacity: 14 }),
      '9/14 ocupada',
    );
  });
});

describe('transferDateTimeLabel', () => {
  it('reads the datetime as UTC and formats it as dd/MM/yyyy às HH:mm', () => {
    const expected = new Date('2025-12-12T14:32:00Z');
    const formatted = transferDateTimeLabel(aTransfer({ createdAt: '2025-12-12T14:32:00' }));
    assert.equal(formatted, transferDateTimeLabel(aTransfer({ createdAt: expected.toISOString() })));
    assert.match(formatted, /^\d{2}\/\d{2}\/2025 às \d{2}:32$/);
  });
});

describe('transferFromLabel', () => {
  it('shows the origin room title when there is one', () => {
    assert.equal(transferFromLabel(aTransfer({ fromRoomTitle: 'Quarentena' })), 'Quarentena');
  });

  it('falls back to "Cadastro inicial" for the first entry in a cat\'s history', () => {
    assert.equal(transferFromLabel(aTransfer({ fromRoomId: null, fromRoomTitle: null })), 'Cadastro inicial');
  });
});

describe('canSubmitTransfer', () => {
  it('requires both a selected room and a non-blank reason', () => {
    assert.equal(canSubmitTransfer(null, ''), false);
    assert.equal(canSubmitTransfer(null, 'Alta clínica.'), false);
    assert.equal(canSubmitTransfer(3, ''), false);
    assert.equal(canSubmitTransfer(3, '   '), false);
    assert.equal(canSubmitTransfer(3, 'Alta clínica.'), true);
  });
});

describe('transferErrorMessage', () => {
  it('shows the backend message as-is for a 400 business-rule violation', () => {
    const error = new FakeApiError('A sala "Sala 51" está lotada.', 400);
    assert.equal(transferErrorMessage(error), 'A sala "Sala 51" está lotada.');
  });

  it('shows a fixed permission message for a 403, regardless of the backend body', () => {
    const error = new FakeApiError('Não foi possível completar a solicitação. Tente novamente.', 403);
    assert.equal(transferErrorMessage(error), 'Você não tem permissão para transferir gatinhos de sala.');
  });

  it('shows a generic message for any other status or a non-ApiError', () => {
    assert.equal(transferErrorMessage(new FakeApiError('erro', 500)), 'Não foi possível transferir o gato.');
    assert.equal(transferErrorMessage(new Error('network down')), 'Não foi possível transferir o gato.');
    assert.equal(transferErrorMessage('not even an Error'), 'Não foi possível transferir o gato.');
  });
});
