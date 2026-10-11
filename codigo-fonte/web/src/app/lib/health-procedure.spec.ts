import { HttpErrorResponse } from '@angular/common/http';

import { HealthProcedure } from '../models/health-procedure.model';
import {
  addMonthsToIsoDate,
  canManageHealthProcedures,
  formatIsoDate,
  healthProcedureName,
  healthProcedureStatusLabel,
  healthProcedureTone,
  serverErrorMessage,
  todayIsoDate,
} from './health-procedure';

describe('health-procedure', () => {
  function mockProcedure(
    overrides: Partial<HealthProcedure> = {},
  ): HealthProcedure {
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

  describe('addMonthsToIsoDate', () => {
    it('adds months on a regular day', () => {
      expect(addMonthsToIsoDate('2026-10-09', 3)).toBe('2027-01-09');
      expect(addMonthsToIsoDate('2026-10-09', 12)).toBe('2027-10-09');
    });

    it('falls back to the last day of a shorter month', () => {
      expect(addMonthsToIsoDate('2026-08-31', 6)).toBe('2027-02-28');
      expect(addMonthsToIsoDate('2027-08-31', 6)).toBe('2028-02-29');
      expect(addMonthsToIsoDate('2026-01-31', 3)).toBe('2026-04-30');
    });

    it('crosses the turn of the year', () => {
      expect(addMonthsToIsoDate('2026-11-15', 3)).toBe('2027-02-15');
      expect(addMonthsToIsoDate('2026-12-31', 12)).toBe('2027-12-31');
    });
  });

  describe('todayIsoDate', () => {
    it('uses the Campo Grande date instead of the browser one', () => {
      expect(todayIsoDate(new Date('2026-10-11T03:59:00Z'))).toBe('2026-10-10');
      expect(todayIsoDate(new Date('2026-10-11T04:00:00Z'))).toBe('2026-10-11');
    });
  });

  describe('serverErrorMessage', () => {
    it('uses the message sent by the server', () => {
      const error = new HttpErrorResponse({
        status: 400,
        error: { message: 'A data agendada não pode ser no passado.' },
      });

      expect(serverErrorMessage(error, 'Fallback')).toBe(
        'A data agendada não pode ser no passado.',
      );
    });

    it('falls back when the server sends no message', () => {
      expect(
        serverErrorMessage(new HttpErrorResponse({ status: 400 }), 'Fallback'),
      ).toBe('Fallback');
      expect(
        serverErrorMessage(
          new HttpErrorResponse({ status: 400, error: { message: '  ' } }),
          'Fallback',
        ),
      ).toBe('Fallback');
    });
  });

  it('formats an ISO date in Brazilian format', () => {
    expect(formatIsoDate('2026-10-09')).toBe('09/10/2026');
  });

  it('lets everyone but viewers manage health procedures', () => {
    expect(canManageHealthProcedures('Administrator')).toBeTrue();
    expect(canManageHealthProcedures('Veterinarian')).toBeTrue();
    expect(canManageHealthProcedures('Assistant')).toBeTrue();
    expect(canManageHealthProcedures('Viewer')).toBeFalse();
    expect(canManageHealthProcedures(undefined)).toBeFalse();
  });

  it('uses the type label as the name of a neutering', () => {
    expect(
      healthProcedureName(mockProcedure({ type: 'Neutering', name: null })),
    ).toBe('Castração');
  });

  it('maps each status to a badge tone', () => {
    expect(healthProcedureTone(mockProcedure())).toBe('warning');
    expect(healthProcedureTone(mockProcedure({ overdue: true }))).toBe(
      'danger',
    );
    expect(healthProcedureTone(mockProcedure({ status: 'Completed' }))).toBe(
      'success',
    );
    expect(healthProcedureTone(mockProcedure({ status: 'Cancelled' }))).toBe(
      'neutral',
    );
    expect(healthProcedureStatusLabel(mockProcedure({ overdue: true }))).toBe(
      'Atrasado',
    );
  });
});
