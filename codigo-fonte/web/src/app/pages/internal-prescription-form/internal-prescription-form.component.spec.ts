import { HttpErrorResponse } from '@angular/common/http';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import {
  ActivatedRoute,
  Router,
  convertToParamMap,
  provideRouter,
} from '@angular/router';
import { Subject, of, throwError } from 'rxjs';

import { Cat } from '../../models/cat.model';
import {
  InternalMedicalPrescription,
  PrescribedMedication,
} from '../../models/medical-prescription.model';
import { PagedResult, StockItem } from '../../models/stock.model';
import { CatService } from '../../services/resources/cat.service';
import { InternalMedicalPrescriptionService } from '../../services/resources/internal-medical-prescription.service';
import { PrescribedMedicationService } from '../../services/resources/prescribed-medication.service';
import { StockService } from '../../services/resources/stock.service';
import { InternalPrescriptionFormComponent } from './internal-prescription-form.component';

describe('InternalPrescriptionFormComponent', () => {
  let component: InternalPrescriptionFormComponent;
  let catServiceSpy: jasmine.SpyObj<CatService>;
  let stockServiceSpy: jasmine.SpyObj<StockService>;
  let prescriptionServiceSpy: jasmine.SpyObj<InternalMedicalPrescriptionService>;
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
      coat: null,
      weightKg: null,
      characteristics: null,
      generalStatus: 'UnderTreatment',
      healthStatus: 'Fiv',
      fivFelvExamDate: null,
      pifResult: 'NotTested',
      pifExamDate: null,
      severity: null,
      neuteringStatus: 'Neutered',
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

  function stockItem(overrides: Partial<StockItem> = {}): StockItem {
    return {
      id: 5,
      name: 'Interferon felino',
      category: 'Medicamento',
      quantity: 20,
      unit: 'ml',
      expirationDate: null,
      notes: null,
      status: 'Normal',
      ...overrides,
    };
  }

  function stockPage(items: StockItem[]): PagedResult<StockItem> {
    return {
      content: items,
      page: 0,
      size: 10,
      totalElements: items.length,
      totalPages: 1,
    };
  }

  function activeMedication(
    overrides: Partial<PrescribedMedication> = {},
  ): PrescribedMedication {
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
      ...overrides,
    };
  }

  function createdPrescription(
    overrides: Partial<InternalMedicalPrescription> = {},
  ): InternalMedicalPrescription {
    return {
      id: 10,
      catId: 9,
      status: 'InTreatment',
      title: 'Reavaliação de FIV+',
      notes: null,
      veterinarianName: 'Dra. Teste',
      veterinarianCrmv: '12345',
      veterinarianUfCrmv: 'MS',
      createdAt: '2026-10-02T10:00:00',
      medication: activeMedication(),
      ...overrides,
    };
  }

  function createComponent(id = '9'): void {
    TestBed.configureTestingModule({
      imports: [InternalPrescriptionFormComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ id }) } },
        },
        { provide: CatService, useValue: catServiceSpy },
        { provide: StockService, useValue: stockServiceSpy },
        {
          provide: InternalMedicalPrescriptionService,
          useValue: prescriptionServiceSpy,
        },
        {
          provide: PrescribedMedicationService,
          useValue: prescribedMedicationServiceSpy,
        },
      ],
    });

    const fixture = TestBed.createComponent(InternalPrescriptionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  function fillValidForm(): void {
    component.form.controls.title.setValue('  Reavaliação de FIV+ ');
    const medication = component.medicationControls;
    medication.dosage.setValue('0,5 ml');
    medication.route.setValue('Subcutaneous');
    medication.intervalHours.setValue(48);
    medication.durationDays.setValue(90);
  }

  beforeEach(() => {
    catServiceSpy = jasmine.createSpyObj<CatService>('CatService', [
      'findById',
    ]);
    stockServiceSpy = jasmine.createSpyObj<StockService>('StockService', [
      'list',
    ]);
    prescriptionServiceSpy =
      jasmine.createSpyObj<InternalMedicalPrescriptionService>(
        'InternalMedicalPrescriptionService',
        ['create'],
      );
    prescribedMedicationServiceSpy =
      jasmine.createSpyObj<PrescribedMedicationService>(
        'PrescribedMedicationService',
        ['listActive'],
      );

    catServiceSpy.findById.and.returnValue(of(mockCat()));
    stockServiceSpy.list.and.returnValue(of(stockPage([stockItem()])));
    prescribedMedicationServiceSpy.listActive.and.returnValue(
      of([activeMedication()]),
    );
  });

  it('loads the cat and its active medications from the route id', () => {
    createComponent();

    expect(catServiceSpy.findById).toHaveBeenCalledWith(9);
    expect(prescribedMedicationServiceSpy.listActive).toHaveBeenCalledWith(9);
    expect(component.cat()).toEqual(mockCat());
    expect(component.activeMedications()).toEqual([activeMedication()]);
  });

  it('shows a not-found message when the id is not a number', () => {
    createComponent('abc');

    expect(component.loadError()).toBe('Gatinho não encontrado.');
    expect(catServiceSpy.findById).not.toHaveBeenCalled();
  });

  it('keeps the form usable when the active medications cannot be loaded', () => {
    prescribedMedicationServiceSpy.listActive.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 500 })),
    );

    createComponent();

    expect(component.cat()).toEqual(mockCat());
    expect(component.activeMedicationsError()).toBe(
      'Não foi possível carregar a medicação ativa.',
    );
  });

  it('builds the summary and tags shown in the side card', () => {
    jasmine.clock().install();
    try {
      jasmine.clock().mockDate(new Date(2026, 9, 2));
      createComponent();

      expect(component.catSummary).toBe(
        'Fêmea · 4 anos · Observação Intensiva',
      );
      expect(component.healthTag).toBe('FIV+');
      expect(component.neuteredTag).toBe('Castrada');
    } finally {
      jasmine.clock().uninstall();
    }
  });

  it('searches the medications in stock after the user stops typing', fakeAsync(() => {
    createComponent();
    component.onMedicationFocus();

    component.medicationControls.name.setValue('inter');
    tick(299);
    expect(stockServiceSpy.list).not.toHaveBeenCalled();

    tick(1);
    expect(stockServiceSpy.list).toHaveBeenCalledWith({
      category: 'Medicamento',
      search: 'inter',
      page: 0,
      size: 10,
    });
    expect(component.suggestions()).toEqual([stockItem()]);
    expect(component.suggestionsOpen()).toBeTrue();
  }));

  it('forgets the chosen medication when the user types a different name', fakeAsync(() => {
    createComponent();
    component.onSelectMedication(stockItem());

    component.medicationControls.name.setValue('Meloxicam');
    expect(component.selectedMedication()).toBeNull();

    tick(300);
    expect(component.isNewMedication).toBeTrue();
  }));

  it('only warns about a new medication after the search answers', fakeAsync(() => {
    createComponent();

    component.medicationControls.name.setValue('Meloxicam');
    expect(component.isNewMedication).toBeFalse();

    tick(300);
    expect(component.isNewMedication).toBeTrue();
  }));

  it('does not warn about a new medication when the search fails', fakeAsync(() => {
    stockServiceSpy.list.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 500 })),
    );
    createComponent();

    component.medicationControls.name.setValue('Meloxicam');
    tick(300);

    expect(component.isNewMedication).toBeFalse();
  }));

  it('selects the stock item when the typed name matches it, ignoring case and accents', fakeAsync(() => {
    stockServiceSpy.list.and.returnValue(
      of(stockPage([stockItem({ name: 'Amoxicilina' })])),
    );
    createComponent();

    component.medicationControls.name.setValue('  amoxicilína ');
    tick(300);

    expect(component.selectedMedication()?.id).toBe(5);
    expect(component.isNewMedication).toBeFalse();
  }));

  it('does not select a stale match when the user kept typing before the search answered', fakeAsync(() => {
    const response = new Subject<PagedResult<StockItem>>();
    stockServiceSpy.list.and.returnValue(response);
    createComponent();

    component.medicationControls.name.setValue('Interferon felino');
    tick(300);
    component.medicationControls.name.setValue('Interferon felino 2');

    response.next(stockPage([stockItem()]));

    expect(component.selectedMedication()).toBeNull();
    expect(component.medicationControls.name.value).toBe('Interferon felino 2');
    tick(300);
  }));

  it('does not submit an invalid form and marks the fields as touched', () => {
    createComponent();

    component.onSubmit();

    expect(prescriptionServiceSpy.create).not.toHaveBeenCalled();
    expect(component.form.controls.title.touched).toBeTrue();
    expect(component.medicationControls.name.touched).toBeTrue();
  });

  it('sends the chosen stock item as medicationId', () => {
    createComponent();
    prescriptionServiceSpy.create.and.returnValue(of(createdPrescription()));
    spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    fillValidForm();
    component.onSelectMedication(stockItem());

    component.onSubmit();

    expect(prescriptionServiceSpy.create).toHaveBeenCalledWith(9, {
      title: 'Reavaliação de FIV+',
      notes: null,
      medication: {
        medicationId: 5,
        newMedicationName: null,
        newMedicationUnit: null,
        dosage: '0,5 ml',
        route: 'Subcutaneous',
        intervalHours: 48,
        durationDays: 90,
      },
    });
  });

  it('sends a new medication name and unit when nothing was chosen from the stock', () => {
    createComponent();
    prescriptionServiceSpy.create.and.returnValue(of(createdPrescription()));
    spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    fillValidForm();
    component.medicationControls.name.setValue('  Meloxicam ');
    component.medicationControls.unit.setValue('ml');

    component.onSubmit();

    expect(prescriptionServiceSpy.create).toHaveBeenCalledWith(
      9,
      jasmine.objectContaining({
        medication: jasmine.objectContaining({
          medicationId: null,
          newMedicationName: 'Meloxicam',
          newMedicationUnit: 'ml',
        }),
      }),
    );
  });

  it('registers only the consultation when the medication toggle is off', () => {
    createComponent();
    prescriptionServiceSpy.create.and.returnValue(
      of(createdPrescription({ medication: null })),
    );
    spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    component.form.controls.title.setValue('Consulta de rotina');

    component.onToggleMedication();
    component.onSubmit();

    expect(prescriptionServiceSpy.create).toHaveBeenCalledWith(9, {
      title: 'Consulta de rotina',
      notes: null,
      medication: null,
    });
  });

  it('returns to the medical record carrying the stock warning', () => {
    createComponent();
    const warning =
      'Meloxicam não existia no estoque e foi cadastrado agora, com estoque zerado.';
    prescriptionServiceSpy.create.and.returnValue(
      of(
        createdPrescription({
          medication: activeMedication({ stockWarning: warning }),
        }),
      ),
    );
    const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(
      true,
    );
    fillValidForm();
    component.medicationControls.name.setValue('Meloxicam');

    component.onSubmit();

    expect(navigate).toHaveBeenCalledWith(['/medical-records', 9], {
      state: { prescriptionCreated: true, stockWarning: warning },
    });
  });

  it('ignores a second submit while the first one is still saving', () => {
    createComponent();
    prescriptionServiceSpy.create.and.returnValue(
      new Subject<InternalMedicalPrescription>(),
    );
    fillValidForm();
    component.onSelectMedication(stockItem());

    component.onSubmit();
    component.onSubmit();

    expect(prescriptionServiceSpy.create).toHaveBeenCalledTimes(1);
    expect(component.saving()).toBeTrue();
  });

  it('explains a duplicated active medication and a missing permission', () => {
    createComponent();
    fillValidForm();
    component.onSelectMedication(stockItem());

    prescriptionServiceSpy.create.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 409 })),
    );
    component.onSubmit();
    expect(component.saveError()).toContain('já está tomando esse medicamento');

    prescriptionServiceSpy.create.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 403 })),
    );
    component.onSubmit();
    expect(component.saveError()).toBe(
      'Apenas veterinários com CRMV cadastrado podem registrar atendimentos internos.',
    );
  });
});
