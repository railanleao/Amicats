import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { HealthProcedure } from '../types/healthProcedure';
import {
  addMonthsToIsoDate,
  boosterDate,
  canManageHealthProcedures,
  changeDescription,
  formatChangedAt,
  healthProcedureErrorMessage,
  healthProcedureName,
  healthProcedureStatusLabel,
  healthProcedureTone,
  parseDateInput,
  todayIsoDate,
} from './healthProcedure';

class FakeApiError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function procedure(overrides: Partial<HealthProcedure> = {}): HealthProcedure {
  return {
    id: 7,
    catId: 2,
    catName: 'Tobias',
    type: 'Vaccine',
    name: 'Antirrábica',
    status: 'Scheduled',
    overdue: false,
    scheduledDate: '2026-10-09',
    completedDate: null,
    notes: null,
    cancelReason: null,
    previousHealthProcedureId: null,
    createdByName: 'Camila Prado',
    createdAt: '2026-10-01T12:00:00',
    ...overrides,
  };
}

describe('canManageHealthProcedures', () => {
  it('lets everyone but viewers manage health procedures', () => {
    assert.equal(canManageHealthProcedures('Administrator'), true);
    assert.equal(canManageHealthProcedures('Veterinarian'), true);
    assert.equal(canManageHealthProcedures('Assistant'), true);
    assert.equal(canManageHealthProcedures('Viewer'), false);
    assert.equal(canManageHealthProcedures(undefined), false);
  });
});

describe('status and name', () => {
  it('uses the type label as the name of a neutering', () => {
    assert.equal(healthProcedureName(procedure({ type: 'Neutering', name: null })), 'Castração');
    assert.equal(healthProcedureName(procedure()), 'Antirrábica');
  });

  it('shows an overdue procedure as late', () => {
    const overdue = procedure({ overdue: true });
    assert.equal(healthProcedureStatusLabel(overdue), 'Atrasado');
    assert.equal(healthProcedureTone(overdue), 'danger');
  });

  it('maps each status to a badge tone', () => {
    assert.equal(healthProcedureTone(procedure()), 'sky');
    assert.equal(healthProcedureTone(procedure({ status: 'Completed' })), 'success');
    assert.equal(healthProcedureTone(procedure({ status: 'Cancelled' })), 'neutral');
  });
});

describe('dates', () => {
  it('uses the Campo Grande date as today', () => {
    assert.equal(todayIsoDate(new Date('2026-10-11T03:59:00Z')), '2026-10-10');
    assert.equal(todayIsoDate(new Date('2026-10-11T04:00:00Z')), '2026-10-11');
  });

  it('accepts only real dates typed as dd/mm/aaaa', () => {
    assert.equal(parseDateInput('09/10/2026'), '2026-10-09');
    assert.equal(parseDateInput('31/02/2026'), null);
    assert.equal(parseDateInput('09/10'), null);
    assert.equal(parseDateInput(''), null);
  });

  it('adds months keeping the last day of shorter months', () => {
    assert.equal(addMonthsToIsoDate('2026-10-09', 3), '2027-01-09');
    assert.equal(addMonthsToIsoDate('2026-08-31', 6), '2027-02-28');
    assert.equal(addMonthsToIsoDate('2027-08-31', 6), '2028-02-29');
    assert.equal(addMonthsToIsoDate('2026-12-31', 12), '2027-12-31');
  });

  it('computes the booster from the completed date or the custom date', () => {
    assert.equal(boosterDate('2026-10-09', 'oneYear', null), '2027-10-09');
    assert.equal(boosterDate('2026-10-09', 'threeMonths', null), '2027-01-09');
    assert.equal(boosterDate(null, 'oneYear', null), null);
    assert.equal(boosterDate('2026-10-09', 'custom', '2026-12-01'), '2026-12-01');
  });

  it('reads the history time as UTC', () => {
    const expected = new Date('2026-10-02T13:30:00Z');
    const formatted = formatChangedAt('2026-10-02T13:30:00');
    assert.equal(formatted, formatChangedAt(expected.toISOString()));
    assert.match(formatted, /^\d{2}\/\d{2}\/2026 \d{2}:30$/);
  });
});

describe('changeDescription', () => {
  it('describes a date change in Brazilian format', () => {
    assert.equal(
      changeDescription({
        id: 1,
        action: 'Updated',
        field: 'ScheduledDate',
        oldValue: '2026-10-05',
        newValue: '2026-10-09',
        userName: 'Camila',
        changedAt: '2026-10-02T13:30:00',
      }),
      'Data agendada: 05/10/2026 → 09/10/2026',
    );
  });

  it('describes a change without an old value and skips the creation', () => {
    const base = { id: 1, userName: 'Camila', changedAt: '2026-10-02T13:30:00' };
    assert.equal(
      changeDescription({ ...base, action: 'Cancelled', field: 'CancelReason', oldValue: null, newValue: 'Óbito' }),
      'Motivo: Óbito',
    );
    assert.equal(changeDescription({ ...base, action: 'Created', field: null, oldValue: null, newValue: null }), null);
  });
});

describe('healthProcedureErrorMessage', () => {
  it('shows the server message for business rule errors', () => {
    assert.equal(
      healthProcedureErrorMessage(new FakeApiError('A data agendada não pode ser no passado.', 400), 'Fallback'),
      'A data agendada não pode ser no passado.',
    );
    assert.equal(
      healthProcedureErrorMessage(new FakeApiError('Tobias já tem uma castração agendada.', 409), 'Fallback'),
      'Tobias já tem uma castração agendada.',
    );
  });

  it('shows a fixed message for a 403', () => {
    assert.equal(
      healthProcedureErrorMessage(new FakeApiError('erro', 403), 'Fallback'),
      'Seu perfil não tem permissão para alterar agendamentos de saúde.',
    );
  });

  it('falls back for anything else', () => {
    assert.equal(healthProcedureErrorMessage(new FakeApiError('erro', 500), 'Fallback'), 'Fallback');
    assert.equal(healthProcedureErrorMessage(new Error('network'), 'Fallback'), 'Fallback');
  });
});
