import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { canSubmitTransfer, occupancySubtitle, transferErrorMessage } from './TransferRoomScreen.logic';

class FakeApiError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

describe('occupancySubtitle', () => {
  it('shows occupied/capacity when the room has a max capacity', () => {
    assert.equal(occupancySubtitle({ id: 1, title: 'Sala 51', occupied: 1, capacity: 6 }), '1/6 ocupada');
  });

  it('falls back to a plain cat count when there is no max capacity', () => {
    assert.equal(
      occupancySubtitle({ id: 1, title: 'Convivência Livre', occupied: 1, capacity: null }),
      '1 gato',
    );
    assert.equal(
      occupancySubtitle({ id: 1, title: 'Convivência Livre', occupied: 3, capacity: null }),
      '3 gatos',
    );
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
