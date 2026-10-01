import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  ActivatedRoute,
  convertToParamMap,
  provideRouter,
} from '@angular/router';
import { Observable, Subject, throwError } from 'rxjs';

import { Cat } from '../../models/cat.model';
import { CatService } from '../../services/resources/cat.service';
import { MedicalRecordDetailComponent } from './medical-record-detail.component';

describe('MedicalRecordDetailComponent (unit)', () => {
  let fixture: ComponentFixture<MedicalRecordDetailComponent>;
  let component: MedicalRecordDetailComponent;
  let catServiceSpy: jasmine.SpyObj<CatService>;

  function mockCat(overrides: Partial<Cat> = {}): Cat {
    return {
      id: 9,
      name: 'Nina',
      photoUrl: null,
      roomId: 2,
      roomTitle: 'Observação Intensiva',
      sex: 'Female',
      estimatedBirthDate: '2022-09-01',
      ageGroup: 'Adult',
      coat: 'Rajada',
      weightKg: 4.1,
      characteristics: null,
      generalStatus: 'InClinic',
      healthStatus: 'Fiv',
      fivFelvExamDate: '2026-09-05',
      pifResult: 'Negative',
      pifExamDate: '2026-09-05',
      severity: null,
      neuteringStatus: 'Neutered',
      neuteringDate: '2025-01-15',
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

  function createComponent(
    options: { id?: string; findByIdResult?: Observable<Cat> } = {},
  ): void {
    const { id = '9', findByIdResult = new Subject<Cat>() } = options;

    catServiceSpy = jasmine.createSpyObj<CatService>('CatService', [
      'findById',
    ]);
    catServiceSpy.findById.and.returnValue(findByIdResult);

    TestBed.configureTestingModule({
      imports: [MedicalRecordDetailComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ id }) } },
        },
        { provide: CatService, useValue: catServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MedicalRecordDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('loads the cat by the route id on init', () => {
    createComponent();

    expect(catServiceSpy.findById).toHaveBeenCalledWith(9);
  });

  it('shows a not-found message when the id is not a number', () => {
    createComponent({ id: 'abc' });

    expect(component.loadError()).toBe('Gatinho não encontrado.');
    expect(catServiceSpy.findById).not.toHaveBeenCalled();
  });

  it('populates the cat once the request resolves', () => {
    const subject = new Subject<Cat>();
    createComponent({ findByIdResult: subject });

    subject.next(mockCat());
    subject.complete();

    expect(component.cat()).toEqual(mockCat());
    expect(component.loading()).toBeFalse();
  });

  it('shows a not-found message on a 404 response', () => {
    createComponent({
      findByIdResult: throwError(() => new HttpErrorResponse({ status: 404 })),
    });

    expect(component.loadError()).toBe('Gatinho não encontrado.');
  });

  it('shows a generic error message on other failures', () => {
    createComponent({
      findByIdResult: throwError(() => new HttpErrorResponse({ status: 500 })),
    });

    expect(component.loadError()).toBe(
      'Não foi possível carregar o prontuário. Tente novamente.',
    );
  });

  it('builds the identity details from sex, age group and health status', () => {
    createComponent();
    component.cat.set(mockCat());

    expect(component.identityDetails).toBe('Fêmea · Adulto · FIV+');
  });

  it('marks FIV positive and FeLV negative for a Fiv-only result', () => {
    createComponent();
    component.cat.set(mockCat({ healthStatus: 'Fiv' }));

    expect(component.fivTag).toBe('positive');
    expect(component.felvTag).toBe('negative');
  });

  it('marks both positive for a FivFelv result', () => {
    createComponent();
    component.cat.set(mockCat({ healthStatus: 'FivFelv' }));

    expect(component.fivTag).toBe('positive');
    expect(component.felvTag).toBe('positive');
  });

  it('marks both not-tested when the cat has not been tested', () => {
    createComponent();
    component.cat.set(mockCat({ healthStatus: 'NotTested' }));

    expect(component.fivTag).toBe('not-tested');
    expect(component.felvTag).toBe('not-tested');
  });

  it('translates the neutering status, falling back to a dash when unknown', () => {
    createComponent();

    component.cat.set(mockCat({ neuteringStatus: 'Neutered' }));
    expect(component.neuteredLabel).toBe('Sim');

    component.cat.set(mockCat({ neuteringStatus: 'NotNeutered' }));
    expect(component.neuteredLabel).toBe('Não');

    component.cat.set(mockCat({ neuteringStatus: 'Scheduled' }));
    expect(component.neuteredLabel).toBe('Agendada');

    component.cat.set(mockCat({ neuteringStatus: null }));
    expect(component.neuteredLabel).toBe('—');
  });

  it('formats the weight, falling back to a dash when unknown', () => {
    createComponent();

    component.cat.set(mockCat({ weightKg: 4.1 }));
    expect(component.weightLabel).toBe('4.1 kg');

    component.cat.set(mockCat({ weightKg: null }));
    expect(component.weightLabel).toBe('—');
  });

  it('exposes no-op placeholder handlers for the new-prescription and external-visit buttons', () => {
    createComponent();

    expect(() => component.onNewPrescription()).not.toThrow();
    expect(() => component.onRegisterExternalVisit()).not.toThrow();
  });
});
