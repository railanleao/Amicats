import { HttpErrorResponse } from '@angular/common/http';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  ActivatedRoute,
  Router,
  convertToParamMap,
  provideRouter,
} from '@angular/router';
import { of, throwError } from 'rxjs';

import { User } from '../../models/auth.model';
import {
  HealthProcedure,
  HealthProcedureChange,
} from '../../models/health-procedure.model';
import { AuthService } from '../../services/resources/auth.service';
import { HealthProcedureService } from '../../services/resources/health-procedure.service';
import { HealthProcedureDetailComponent } from './health-procedure-detail.component';

describe('HealthProcedureDetailComponent', () => {
  let component: HealthProcedureDetailComponent;
  let healthProcedureServiceSpy: jasmine.SpyObj<HealthProcedureService>;
  let currentUser: ReturnType<typeof signal<User | null>>;

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
      notes: 'Levar carteira.',
      cancelReason: null,
      previousHealthProcedureId: null,
      createdByName: 'Camila Prado',
      createdAt: '2026-10-01T12:00:00',
      ...overrides,
    };
  }

  function mockChange(
    overrides: Partial<HealthProcedureChange> = {},
  ): HealthProcedureChange {
    return {
      id: 1,
      action: 'Updated',
      field: 'ScheduledDate',
      oldValue: '2026-10-05',
      newValue: '2026-10-09',
      userName: 'Camila Prado',
      changedAt: '2026-10-02T13:30:00',
      ...overrides,
    };
  }

  function createComponent(): void {
    TestBed.configureTestingModule({
      imports: [HealthProcedureDetailComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ id: '7' }) } },
        },
        {
          provide: HealthProcedureService,
          useValue: healthProcedureServiceSpy,
        },
        {
          provide: AuthService,
          useValue: jasmine.createSpyObj<AuthService>('AuthService', [], {
            currentUser,
          }),
        },
      ],
    });

    const fixture = TestBed.createComponent(HealthProcedureDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(() => {
    currentUser = signal<User | null>({
      id: 1,
      name: 'Camila Prado',
      accessType: 'Veterinarian',
    });

    healthProcedureServiceSpy = jasmine.createSpyObj<HealthProcedureService>(
      'HealthProcedureService',
      ['findById', 'listChanges', 'complete', 'cancel'],
    );
    healthProcedureServiceSpy.findById.and.returnValue(of(mockProcedure()));
    healthProcedureServiceSpy.listChanges.and.returnValue(of([mockChange()]));
  });

  it('loads the procedure and its history from the route id', () => {
    createComponent();

    expect(healthProcedureServiceSpy.findById).toHaveBeenCalledWith(7);
    expect(healthProcedureServiceSpy.listChanges).toHaveBeenCalledWith(7);
    expect(component.procedure()).toEqual(mockProcedure());
    expect(component.changes()).toEqual([mockChange()]);
  });

  it('lets a manager change a scheduled procedure', () => {
    createComponent();

    expect(component.canChange()).toBeTrue();
  });

  it('does not let a viewer change the procedure', () => {
    currentUser.set({ id: 4, name: 'Paula', accessType: 'Viewer' });
    createComponent();

    expect(component.canChange()).toBeFalse();
  });

  it('does not allow changes once the procedure is no longer scheduled', () => {
    healthProcedureServiceSpy.findById.and.returnValue(
      of(mockProcedure({ status: 'Cancelled', cancelReason: 'Óbito' })),
    );
    createComponent();

    expect(component.canChange()).toBeFalse();
  });

  it('describes a date change in Brazilian format', () => {
    createComponent();

    expect(component.changeDescription(mockChange())).toBe(
      'Data agendada: 05/10/2026 → 09/10/2026',
    );
  });

  it('describes a change without an old value and skips the creation', () => {
    createComponent();

    expect(
      component.changeDescription(
        mockChange({
          field: 'CancelReason',
          oldValue: null,
          newValue: 'Óbito',
        }),
      ),
    ).toBe('Motivo: Óbito');
    expect(
      component.changeDescription(
        mockChange({ action: 'Created', field: null, newValue: null }),
      ),
    ).toBeNull();
  });

  it('treats the history time as UTC', () => {
    createComponent();

    expect(component.changedAt(mockChange())).toBe('2026-10-02T13:30:00Z');
  });

  it('keeps the current notes when completing without a booster', () => {
    healthProcedureServiceSpy.complete.and.returnValue(
      of(mockProcedure({ status: 'Completed', completedDate: '2026-10-09' })),
    );
    createComponent();
    component.openCompletePanel();
    component.completeForm.controls.completedDate.setValue('2026-10-09');

    component.confirmComplete();

    expect(healthProcedureServiceSpy.complete).toHaveBeenCalledWith(7, {
      completedDate: '2026-10-09',
      notes: 'Levar carteira.',
      boosterDate: null,
    });
    expect(component.openPanel()).toBeNull();
    expect(component.successMessage()).toBe(
      'Agendamento marcado como realizado.',
    );
  });

  it('schedules the booster one year after the vaccine', () => {
    healthProcedureServiceSpy.complete.and.returnValue(
      of(mockProcedure({ status: 'Completed', completedDate: '2026-10-09' })),
    );
    createComponent();
    component.openCompletePanel();
    component.completeForm.patchValue({
      completedDate: '2026-10-09',
      scheduleBooster: true,
      boosterOption: 'oneYear',
    });

    component.confirmComplete();

    expect(healthProcedureServiceSpy.complete).toHaveBeenCalledWith(
      7,
      jasmine.objectContaining({ boosterDate: '2027-10-09' }),
    );
    expect(component.successMessage()).toContain('09/10/2027');
  });

  it('requires a date for a custom booster', () => {
    createComponent();
    component.openCompletePanel();
    component.completeForm.patchValue({
      scheduleBooster: true,
      boosterOption: 'custom',
    });

    component.confirmComplete();

    expect(component.boosterMissing).toBeTrue();
    expect(healthProcedureServiceSpy.complete).not.toHaveBeenCalled();
  });

  it('never sends a booster for a neutering', () => {
    healthProcedureServiceSpy.findById.and.returnValue(
      of(mockProcedure({ type: 'Neutering', name: null })),
    );
    createComponent();
    component.openCompletePanel();
    component.completeForm.patchValue({ scheduleBooster: true });

    expect(component.boosterDate).toBeNull();
  });

  it('requires a reason to cancel', () => {
    createComponent();
    component.openCancelPanel();

    component.confirmCancel();

    expect(healthProcedureServiceSpy.cancel).not.toHaveBeenCalled();
    expect(component.cancelForm.controls.reason.touched).toBeTrue();
  });

  it('cancels with the trimmed reason and reloads the history', () => {
    healthProcedureServiceSpy.cancel.and.returnValue(
      of(mockProcedure({ status: 'Cancelled', cancelReason: 'Óbito' })),
    );
    createComponent();
    component.openCancelPanel();
    component.cancelForm.controls.reason.setValue('  Óbito ');

    component.confirmCancel();

    expect(healthProcedureServiceSpy.cancel).toHaveBeenCalledWith(7, {
      reason: 'Óbito',
    });
    expect(component.procedure()?.status).toBe('Cancelled');
    expect(healthProcedureServiceSpy.listChanges).toHaveBeenCalledTimes(2);
  });

  it('explains invalid dates when completing', () => {
    healthProcedureServiceSpy.complete.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 400 })),
    );
    createComponent();
    component.openCompletePanel();

    component.confirmComplete();

    expect(component.actionError()).toContain('Confira as datas');
  });

  it('navigates to the edit form', () => {
    createComponent();
    const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(
      true,
    );

    component.editProcedure();

    expect(navigate).toHaveBeenCalledWith(['/health-procedures', 7, 'edit']);
  });
});
