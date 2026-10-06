import { HttpErrorResponse } from '@angular/common/http';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  ActivatedRoute,
  Router,
  convertToParamMap,
  provideRouter,
} from '@angular/router';
import { Observable, Subject, of, throwError } from 'rxjs';

import { Cat } from '../../models/cat.model';
import { PrescribedMedication } from '../../models/medical-prescription.model';
import { AuthService } from '../../services/resources/auth.service';
import { CatService } from '../../services/resources/cat.service';
import { PrescribedMedicationService } from '../../services/resources/prescribed-medication.service';
import { MedicalRecordDetailComponent } from '../../../../../../../medical-record-detail/medical-record-detail.component';

describe('MedicalRecordDetailComponent (unit)', () => {
  let fixture: ComponentFixture<MedicalRecordDetailComponent>;
  let component: MedicalRecordDetailComponent;
  let catServiceSpy: jasmine.SpyObj<CatService>;
  let prescribedMedicationServiceSpy: jasmine.SpyObj<PrescribedMedicationService>;

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

  function activeMedication(): PrescribedMedication {
    return {
      id: 1,
      origin: 'Internal',
      medicalPrescriptionId: 3,
      medicationId: 5,
      medicationName: 'Interferon felino',
      medicationStockStatus: 'Normal',
      dosage: '0,5 ml',
      route: 'Subcutaneous',
      intervalHours: 48,
      durationDays: 90,
      startDate: '2026-08-19',
      endDate: '2026-11-16',
      status: 'Active',
      stockWarning: null,
    };
  }

  function createComponent(
    options: {
      id?: string;
      findByIdResult?: Observable<Cat>;
      listActiveResult?: Observable<PrescribedMedication[]>;
      accessType?: string;
    } = {},
  ): void {
    const {
      id = '9',
      findByIdResult = new Subject<Cat>(),
      listActiveResult = of([]),
      accessType = 'Veterinarian',
    } = options;

    catServiceSpy = jasmine.createSpyObj<CatService>('CatService', [
      'findById',
    ]);
    catServiceSpy.findById.and.returnValue(findByIdResult);

    prescribedMedicationServiceSpy =
      jasmine.createSpyObj<PrescribedMedicationService>(
        'PrescribedMedicationService',
        ['listActive'],
      );
    prescribedMedicationServiceSpy.listActive.and.returnValue(listActiveResult);

    const authServiceStub = {
      currentUser: signal({ id: 1, name: 'Usuária', accessType }),
    } as unknown as AuthService;

    TestBed.configureTestingModule({
      imports: [MedicalRecordDetailComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ id }) } },
        },
        { provide: CatService, useValue: catServiceSpy },
        {
          provide: PrescribedMedicationService,
          useValue: prescribedMedicationServiceSpy,
        },
        { provide: AuthService, useValue: authServiceStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MedicalRecordDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('loads the cat and its active medications by the route id on init', () => {
    createComponent();

    expect(catServiceSpy.findById).toHaveBeenCalledWith(9);
    expect(prescribedMedicationServiceSpy.listActive).toHaveBeenCalledWith(9);
  });

  it('shows a not-found message when the id is not a number', () => {
    createComponent({ id: 'abc' });

    expect(component.loadError()).toBe('Gatinho não encontrado.');
    expect(catServiceSpy.findById).not.toHaveBeenCalled();
    expect(prescribedMedicationServiceSpy.listActive).not.toHaveBeenCalled();
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

  it('fills the active medication card', () => {
    createComponent({ listActiveResult: of([activeMedication()]) });

    expect(component.activeMedications()).toEqual([activeMedication()]);
  });

  it('shows a message when the active medications cannot be loaded', () => {
    createComponent({
      listActiveResult: throwError(
        () => new HttpErrorResponse({ status: 500 }),
      ),
    });

    expect(component.activeMedicationsError()).toBe(
      'Não foi possível carregar a medicação ativa.',
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

  it('lets only veterinarians prescribe', () => {
    createComponent({ accessType: 'Veterinarian' });
    expect(component.canPrescribe()).toBeTrue();

    TestBed.resetTestingModule();
    createComponent({ accessType: 'Administrator' });
    expect(component.canPrescribe()).toBeFalse();
  });

  it('opens the new internal prescription page', () => {
    createComponent();
    const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(
      true,
    );

    component.onNewPrescription();

    expect(navigate).toHaveBeenCalledWith([
      '/medical-records',
      9,
      'internal-prescriptions',
      'new',
    ]);
  });

  it('opens the new external attendance page', () => {
    createComponent();
    const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(
      true,
    );

    component.onRegisterExternalVisit();

    expect(navigate).toHaveBeenCalledWith([
      '/medical-records',
      9,
      'external-attendances',
      'new',
    ]);
  });
});
