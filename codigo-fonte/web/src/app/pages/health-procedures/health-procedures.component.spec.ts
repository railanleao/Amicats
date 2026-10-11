import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { signal } from '@angular/core';
import {
  ActivatedRoute,
  Router,
  convertToParamMap,
  provideRouter,
} from '@angular/router';
import { Subject, throwError } from 'rxjs';

import { User } from '../../models/auth.model';
import { PagedResult } from '../../models/cat.model';
import {
  HealthProcedure,
  HealthProcedureSearchParams,
} from '../../models/health-procedure.model';
import { AuthService } from '../../services/resources/auth.service';
import { HealthProcedureService } from '../../services/resources/health-procedure.service';
import { HealthProceduresComponent } from './health-procedures.component';

describe('HealthProceduresComponent (unit)', () => {
  let fixture: ComponentFixture<HealthProceduresComponent>;
  let component: HealthProceduresComponent;
  let healthProcedureServiceSpy: jasmine.SpyObj<HealthProcedureService>;
  let currentUser: ReturnType<typeof signal<User | null>>;

  function mockProcedure(
    overrides: Partial<HealthProcedure> = {},
  ): HealthProcedure {
    return {
      id: 1,
      catId: 2,
      catName: 'Tobias',
      type: 'Vaccine',
      name: 'Vacina antirrábica',
      status: 'Scheduled',
      overdue: false,
      scheduledDate: '2026-10-12',
      completedDate: null,
      notes: null,
      cancelReason: null,
      previousHealthProcedureId: null,
      createdByName: 'Camila Prado',
      createdAt: '2026-10-09T08:55:11',
      ...overrides,
    };
  }

  function paged(
    content: HealthProcedure[],
    totalPages = 1,
  ): PagedResult<HealthProcedure> {
    return {
      content,
      page: 0,
      size: 20,
      totalElements: content.length,
      totalPages,
    };
  }

  function latestListSubject(): Subject<PagedResult<HealthProcedure>> {
    return healthProcedureServiceSpy.list.calls.mostRecent()
      .returnValue as Subject<PagedResult<HealthProcedure>>;
  }

  function newButton(): HTMLElement | null {
    return fixture.nativeElement.querySelector('.new-button');
  }

  async function createComponent(
    queryParams: Record<string, string> = {},
  ): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [HealthProceduresComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { queryParamMap: convertToParamMap(queryParams) },
          },
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
    }).compileComponents();

    fixture = TestBed.createComponent(HealthProceduresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(() => {
    currentUser = signal<User | null>({
      id: 1,
      name: 'Camila Prado',
      accessType: 'Assistant',
    });

    healthProcedureServiceSpy = jasmine.createSpyObj<HealthProcedureService>(
      'HealthProcedureService',
      ['list'],
    );
    healthProcedureServiceSpy.list.and.callFake(
      () => new Subject<PagedResult<HealthProcedure>>(),
    );
  });

  it('loads the scheduled procedures on init with the default page and size', async () => {
    await createComponent();

    expect(healthProcedureServiceSpy.list).toHaveBeenCalledWith({
      search: undefined,
      catId: undefined,
      type: undefined,
      status: 'Scheduled',
      page: 0,
      size: component.pageSize,
    } as HealthProcedureSearchParams);
  });

  it('filters by the cat given in the query string', async () => {
    await createComponent({ catId: '2' });

    expect(component.catFilterId()).toBe(2);
    expect(healthProcedureServiceSpy.list).toHaveBeenCalledWith(
      jasmine.objectContaining({ catId: 2 }),
    );
  });

  it('removes the cat filter and reloads everything', async () => {
    await createComponent({ catId: '2' });
    spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    healthProcedureServiceSpy.list.calls.reset();

    component.clearCatFilter();

    expect(component.catFilterId()).toBeNull();
    expect(healthProcedureServiceSpy.list).toHaveBeenCalledWith(
      jasmine.objectContaining({ catId: undefined, page: 0 }),
    );
  });

  it('populates the list, total elements and total pages once the request resolves', async () => {
    await createComponent();
    const subject = latestListSubject();

    subject.next(paged([mockProcedure()], 3));
    subject.complete();

    expect(component.procedures()).toEqual([mockProcedure()]);
    expect(component.totalElements()).toBe(1);
    expect(component.totalPages()).toBe(3);
    expect(component.loading()).toBeFalse();
  });

  it('shows an error message when the list request fails', async () => {
    await createComponent();
    healthProcedureServiceSpy.list.and.returnValue(
      throwError(() => new Error('network error')),
    );

    component.loadProcedures();

    expect(component.errorMessage()).toBe(
      'Não foi possível carregar os agendamentos. Tente novamente.',
    );
  });

  it('clears the previous list when a new filter fails', async () => {
    await createComponent();
    latestListSubject().next(paged([mockProcedure()]));
    healthProcedureServiceSpy.list.and.returnValue(
      throwError(() => new Error('network error')),
    );

    component.selectType('Neutering');

    expect(component.procedures()).toEqual([]);
    expect(component.totalElements()).toBe(0);
    expect(component.totalPages()).toBe(0);
  });

  it('ignores a slow response from a previous filter', async () => {
    await createComponent();
    const allTypes = latestListSubject();
    component.selectType('Neutering');
    const neutering = latestListSubject();
    const castration = mockProcedure({ id: 2, type: 'Neutering', name: null });

    neutering.next(paged([castration]));
    allTypes.next(paged([mockProcedure()]));

    expect(component.procedures()).toEqual([castration]);
  });

  it('debounces search input and requests page zero with the typed term', fakeAsync(() => {
    void createComponent();
    tick();
    healthProcedureServiceSpy.list.calls.reset();

    component.onSearch({ target: { value: ' tobias ' } } as unknown as Event);
    tick(299);
    expect(healthProcedureServiceSpy.list).not.toHaveBeenCalled();

    tick(1);
    expect(healthProcedureServiceSpy.list).toHaveBeenCalledWith(
      jasmine.objectContaining({ search: 'tobias', page: 0 }),
    );
  }));

  it('resets to page zero and reloads when the type changes', async () => {
    await createComponent();
    component.onPageChange(2);
    healthProcedureServiceSpy.list.calls.reset();

    component.selectType('Neutering');

    expect(healthProcedureServiceSpy.list).toHaveBeenCalledWith(
      jasmine.objectContaining({ type: 'Neutering', page: 0 }),
    );
  });

  it('resets to page zero and reloads when the status tab changes', async () => {
    await createComponent();
    component.onPageChange(2);
    healthProcedureServiceSpy.list.calls.reset();

    component.selectStatus('Cancelled');

    expect(healthProcedureServiceSpy.list).toHaveBeenCalledWith(
      jasmine.objectContaining({ status: 'Cancelled', page: 0 }),
    );
  });

  it('requests the given page when the pagination component emits a page change', async () => {
    await createComponent();
    healthProcedureServiceSpy.list.calls.reset();

    component.onPageChange(1);

    expect(component.page()).toBe(1);
    expect(healthProcedureServiceSpy.list).toHaveBeenCalledWith(
      jasmine.objectContaining({ page: 1 }),
    );
  });

  it('labels an overdue procedure as late instead of scheduled', async () => {
    await createComponent();
    const overdue = mockProcedure({ overdue: true });

    expect(component.statusLabel(overdue)).toBe('Atrasado');
    expect(component.statusTone(overdue)).toBe('danger');
  });

  it('uses the type label as the name of a neutering', async () => {
    await createComponent();
    const neutering = mockProcedure({ type: 'Neutering', name: null });

    expect(component.procedureName(neutering)).toBe('Castração');
  });

  it('shows the new appointment button to an assistant', async () => {
    await createComponent();

    expect(component.canManage()).toBeTrue();
    expect(newButton()).not.toBeNull();
  });

  it('hides the new appointment button from a viewer', async () => {
    currentUser.set({ id: 4, name: 'Paula', accessType: 'Viewer' });
    await createComponent();

    expect(component.canManage()).toBeFalse();
    expect(newButton()).toBeNull();
  });

  it('navigates to the new appointment form carrying the cat filter', async () => {
    await createComponent({ catId: '2' });
    const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(
      true,
    );

    component.createProcedure();

    expect(navigate).toHaveBeenCalledWith(['/health-procedures/new'], {
      queryParams: { catId: 2 },
    });
  });

  it('navigates to the detail of the given procedure', async () => {
    await createComponent();
    const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(
      true,
    );

    component.openProcedure(mockProcedure());

    expect(navigate).toHaveBeenCalledWith(['/health-procedures', 1]);
  });
});
