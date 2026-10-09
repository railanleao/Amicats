import {HttpErrorResponse} from '@angular/common/http';
import {fakeAsync, TestBed, tick} from '@angular/core/testing';
import {ActivatedRoute, convertToParamMap, provideRouter, Router,} from '@angular/router';
import {of, throwError} from 'rxjs';

import {Cat, PagedResult} from '../../models/cat.model';
import {CatHealthSummary, HealthProcedure,} from '../../models/health-procedure.model';
import {CatService} from '../../services/resources/cat.service';
import {HealthProcedureService} from '../../services/resources/health-procedure.service';
import {HealthProcedureFormComponent} from './health-procedure-form.component';

describe('HealthProcedureFormComponent', () => {
  let component: HealthProcedureFormComponent;
  let catServiceSpy: jasmine.SpyObj<CatService>;
  let healthProcedureServiceSpy: jasmine.SpyObj<HealthProcedureService>;

  function mockCat(overrides: Partial<Cat> = {}): Cat {
    return {
      id: 2,
      name: 'Tobias',
      photoUrl: null,
      roomId: 1,
      roomTitle: 'Saudáveis',
      sex: 'Male',
      estimatedBirthDate: null,
      ageGroup: 'Adult',
      coat: null,
      weightKg: null,
      characteristics: null,
      generalStatus: 'AvailableForAdoption',
      healthStatus: 'Healthy',
      fivFelvExamDate: null,
      pifResult: 'NotTested',
      pifExamDate: null,
      severity: null,
      neuteringStatus: 'NotNeutered',
      neuteringDate: null,
      microchip: null,
      rescueDate: null,
      foundConditions: null,
      sponsorName: null,
      sponsorPhone: null,
      sponsorFunding: null,
      createdAt: '2026-01-01T00:00:00',
      ...overrides,
    };
  }

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
      scheduledDate: '2026-10-20',
      completedDate: null,
      notes: null,
      cancelReason: null,
      previousHealthProcedureId: null,
      createdByName: 'Camila Prado',
      createdAt: '2026-10-09T08:55:11',
      ...overrides,
    };
  }

  function mockSummary(): CatHealthSummary {
    return {
      catId: 2,
      neuteringStatus: 'NotNeutered',
      neuteringDate: null,
      lastVaccine: null,
      lastDeworming: null,
      nextScheduled: null,
    };
  }

  function catPage(cats: Cat[]): PagedResult<Cat> {
    return {
      content: cats,
      page: 0,
      size: 10,
      totalElements: cats.length,
      totalPages: 1,
    };
  }

  function createComponent(
    mode: 'create' | 'edit',
    params: Record<string, string> = {},
    queryParams: Record<string, string> = {},
  ): void {
    TestBed.configureTestingModule({
      imports: [HealthProcedureFormComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: { mode },
              paramMap: convertToParamMap(params),
              queryParamMap: convertToParamMap(queryParams),
            },
          },
        },
        { provide: CatService, useValue: catServiceSpy },
        {
          provide: HealthProcedureService,
          useValue: healthProcedureServiceSpy,
        },
      ],
    });

    const fixture = TestBed.createComponent(HealthProcedureFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  function fillValidForm(): void {
    component.onSelectCat(mockCat());
    component.form.controls.type.setValue('Vaccine');
    component.form.controls.name.setValue('  Antirrábica ');
    component.form.controls.scheduledDate.setValue('2026-10-20');
  }

  beforeEach(() => {
    catServiceSpy = jasmine.createSpyObj<CatService>('CatService', [
      'list',
      'findById',
    ]);
    healthProcedureServiceSpy = jasmine.createSpyObj<HealthProcedureService>(
      'HealthProcedureService',
      ['findById', 'summarize', 'create', 'update'],
    );

    catServiceSpy.list.and.returnValue(of(catPage([mockCat()])));
    catServiceSpy.findById.and.returnValue(of(mockCat()));
    healthProcedureServiceSpy.summarize.and.returnValue(of(mockSummary()));
  });

  it('searches the cats after the user stops typing', fakeAsync(() => {
    createComponent('create');
    component.onCatFocus();

    component.form.controls.cat.setValue('tob');
    tick(299);
    expect(catServiceSpy.list).not.toHaveBeenCalled();

    tick(1);
    expect(catServiceSpy.list).toHaveBeenCalledWith({
      search: 'tob',
      page: 0,
      size: 10,
    });
    expect(component.catSuggestionsOpen()).toBeTrue();
  }));

  it('loads the health summary of the chosen cat', () => {
    createComponent('create');

    component.onSelectCat(mockCat());

    expect(healthProcedureServiceSpy.summarize).toHaveBeenCalledWith(2);
    expect(component.summary()).toEqual(mockSummary());
  });

  it('preselects the cat given in the query string', () => {
    createComponent('create', {}, { catId: '2' });

    expect(catServiceSpy.findById).toHaveBeenCalledWith(2);
    expect(component.selectedCat()).toEqual({ id: 2, name: 'Tobias' });
  });

  it('forgets the chosen cat when the user types another name', () => {
    createComponent('create');
    component.onSelectCat(mockCat());

    component.form.controls.cat.setValue('Mel');

    expect(component.selectedCat()).toBeNull();
    expect(component.summary()).toBeNull();
  });

  it('does not require a name for a neutering', () => {
    createComponent('create');

    component.form.controls.type.setValue('Neutering');

    expect(component.requiresName).toBeFalse();
    expect(component.form.controls.name.valid).toBeTrue();
  });

  it('does not submit without a cat chosen from the list', () => {
    createComponent('create');
    component.form.controls.cat.setValue('Gato que não existe');
    component.form.controls.type.setValue('Neutering');
    component.form.controls.scheduledDate.setValue('2026-10-20');

    component.onSubmit();

    expect(healthProcedureServiceSpy.create).not.toHaveBeenCalled();
    expect(component.catNotSelected).toBeTrue();
  });

  it('creates the appointment and opens its detail', () => {
    createComponent('create');
    healthProcedureServiceSpy.create.and.returnValue(of(mockProcedure()));
    const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(
      true,
    );
    fillValidForm();

    component.onSubmit();

    expect(healthProcedureServiceSpy.create).toHaveBeenCalledWith({
      catId: 2,
      type: 'Vaccine',
      name: 'Antirrábica',
      scheduledDate: '2026-10-20',
      notes: null,
    });
    expect(navigate).toHaveBeenCalledWith(['/health-procedures', 7]);
  });

  it('sends no name for a neutering', () => {
    createComponent('create');
    healthProcedureServiceSpy.create.and.returnValue(
      of(mockProcedure({ type: 'Neutering', name: null })),
    );
    spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    fillValidForm();
    component.form.controls.type.setValue('Neutering');

    component.onSubmit();

    expect(healthProcedureServiceSpy.create).toHaveBeenCalledWith(
      jasmine.objectContaining({ type: 'Neutering', name: null }),
    );
  });

  it('fills the form and locks cat and type when editing', () => {
    healthProcedureServiceSpy.findById.and.returnValue(of(mockProcedure()));

    createComponent('edit', { id: '7' });

    expect(component.form.controls.name.value).toBe('Antirrábica');
    expect(component.form.controls.scheduledDate.value).toBe('2026-10-20');
    expect(component.form.controls.cat.disabled).toBeTrue();
    expect(component.form.controls.type.disabled).toBeTrue();
  });

  it('updates the appointment when editing', () => {
    healthProcedureServiceSpy.findById.and.returnValue(of(mockProcedure()));
    healthProcedureServiceSpy.update.and.returnValue(of(mockProcedure()));
    createComponent('edit', { id: '7' });
    spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    component.form.controls.scheduledDate.setValue('2026-10-25');

    component.onSubmit();

    expect(healthProcedureServiceSpy.update).toHaveBeenCalledWith(7, {
      name: 'Antirrábica',
      scheduledDate: '2026-10-25',
      notes: null,
    });
  });

  it('refuses to edit an appointment that is no longer scheduled', () => {
    healthProcedureServiceSpy.findById.and.returnValue(
      of(mockProcedure({ status: 'Completed', completedDate: '2026-10-09' })),
    );

    createComponent('edit', { id: '7' });

    expect(component.loadError()).toContain('Só é possível editar');
  });

  it('explains a conflicting neutering', () => {
    createComponent('create');
    healthProcedureServiceSpy.create.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 409 })),
    );
    fillValidForm();

    component.onSubmit();

    expect(component.saveError()).toContain('já está castrado');
  });
});
