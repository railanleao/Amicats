import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  ActivatedRoute,
  convertToParamMap,
  provideRouter,
} from '@angular/router';
import { of, throwError } from 'rxjs';

import { Cat } from '../../models/cat.model';
import { CatService } from '../../services/resources/cat.service';
import { CatDetailComponent } from './cat-detail.component';

describe('CatDetailComponent (unit)', () => {
  let fixture: ComponentFixture<CatDetailComponent>;
  let component: CatDetailComponent;
  let catServiceSpy: jasmine.SpyObj<CatService>;

  function mockCat(overrides: Partial<Cat> = {}): Cat {
    return {
      id: 1,
      name: 'Nina',
      photoUrl: null,
      roomId: 2,
      roomTitle: 'Observação Intensiva',
      sex: 'Female',
      estimatedBirthDate: '2022-09-01',
      ageGroup: 'Adult',
      coat: 'Tricolor, pelo curto',
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
      microchip: '982000123456789',
      rescueDate: '2025-08-01',
      foundConditions: 'Desnutrida, ferida na pata',
      sponsorName: 'Fernanda Costa',
      sponsorPhone: '(31) 99145-8820',
      sponsorFunding: 'Ração terapêutica e exames',
      createdAt: '2026-01-01T00:00:00',
      ...overrides,
    };
  }

  function createComponent(id = '1'): void {
    TestBed.configureTestingModule({
      imports: [CatDetailComponent],
      providers: [
        provideRouter([]),
        { provide: CatService, useValue: catServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: convertToParamMap({ id }) },
          },
        },
      ],
    });

    fixture = TestBed.createComponent(CatDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(() => {
    catServiceSpy = jasmine.createSpyObj<CatService>('CatService', [
      'findById',
      'photo',
    ]);
  });

  it('loads the cat by the id from the route on init', () => {
    catServiceSpy.findById.and.returnValue(of(mockCat()));

    createComponent('1');

    expect(catServiceSpy.findById).toHaveBeenCalledWith(1);
    expect(component.cat()).toEqual(mockCat());
    expect(component.loading()).toBeFalse();
  });

  it('shows an error message when the request fails', () => {
    catServiceSpy.findById.and.returnValue(
      throwError(() => new Error('network error')),
    );

    createComponent('1');

    expect(component.errorMessage()).toBe(
      'Não foi possível carregar a ficha do gato. Tente novamente.',
    );
  });

  it('falls back to "Lar temporário" for a room-less cat in temporary home', () => {
    catServiceSpy.findById.and.returnValue(of(mockCat()));
    createComponent();

    const cat = mockCat({ roomTitle: null, generalStatus: 'TemporaryHome' });
    expect(component.roomLabel(cat)).toBe('Lar temporário');
  });

  it('falls back to a dash for a room-less cat that is not in temporary home', () => {
    catServiceSpy.findById.and.returnValue(of(mockCat()));
    createComponent();

    const cat = mockCat({ roomTitle: null, generalStatus: 'InTriage' });
    expect(component.roomLabel(cat)).toBe('—');
  });

  it('splits the combined health status into separate FIV and FeLV results', () => {
    catServiceSpy.findById.and.returnValue(of(mockCat()));
    createComponent();

    const fivFelv = mockCat({ healthStatus: 'FivFelv' });
    expect(component.fivLabel(fivFelv)).toBe('Positivo');
    expect(component.felvLabel(fivFelv)).toBe('Positivo');

    const fivOnly = mockCat({ healthStatus: 'Fiv' });
    expect(component.fivLabel(fivOnly)).toBe('Positivo');
    expect(component.felvLabel(fivOnly)).toBe('Negativo');

    const notTested = mockCat({ healthStatus: 'NotTested' });
    expect(component.fivLabel(notTested)).toBe('Não testado');
    expect(component.felvLabel(notTested)).toBe('Não testado');
  });

  it('computes the age from the estimated birth date', () => {
    catServiceSpy.findById.and.returnValue(of(mockCat()));
    createComponent();

    jasmine.clock().install();
    try {
      jasmine.clock().mockDate(new Date(2026, 8, 1));

      expect(
        component.ageLabel(mockCat({ estimatedBirthDate: '2022-09-01' })),
      ).toBe('4 anos');
      expect(
        component.ageLabel(mockCat({ estimatedBirthDate: '2025-09-02' })),
      ).toBe('11 meses');
      expect(component.ageLabel(mockCat({ estimatedBirthDate: null }))).toBe(
        '—',
      );
    } finally {
      jasmine.clock().uninstall();
    }
  });

  it('formats createdAt as a pt-BR date', () => {
    catServiceSpy.findById.and.returnValue(of(mockCat()));
    createComponent();

    expect(
      component.createdAtLabel(mockCat({ createdAt: '2025-12-08T10:00:00' })),
    ).toBe('08/12/2025');
  });

  it('labels neutering status, defaulting to "Não informado" when absent', () => {
    catServiceSpy.findById.and.returnValue(of(mockCat()));
    createComponent();

    expect(
      component.neuteringLabel(mockCat({ neuteringStatus: 'Neutered' })),
    ).toBe('Sim');
    expect(component.neuteringLabel(mockCat({ neuteringStatus: null }))).toBe(
      'Não informado',
    );
  });
});
