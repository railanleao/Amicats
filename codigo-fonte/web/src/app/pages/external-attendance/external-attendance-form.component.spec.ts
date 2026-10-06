import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  ActivatedRoute,
  convertToParamMap,
  provideRouter,
} from '@angular/router';
import { of } from 'rxjs';

import { Cat } from '../../models/cat.model';
import { ExternalAttendance } from '../../models/external-attendance.model';
import { CatService } from '../../services/resources/cat.service';
import { ExternalAttendanceService } from '../../services/resources/external-attendance.service';
import { ExternalAttendanceFormComponent } from './external-attendance-form.component';

describe('ExternalAttendanceFormComponent', () => {
  let component: ExternalAttendanceFormComponent;
  let fixture: ComponentFixture<ExternalAttendanceFormComponent>;
  let catServiceSpy: jasmine.SpyObj<CatService>;
  let attendanceServiceSpy: jasmine.SpyObj<ExternalAttendanceService>;

  function mockCat(): Cat {
    return {
      id: 9,
      name: 'Nina',
      photoUrl: null,
      roomId: 2,
      roomTitle: 'Observação',
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
    };
  }

  function createComponent(id = '9'): void {
    TestBed.configureTestingModule({
      imports: [ExternalAttendanceFormComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ id }) } },
        },
        { provide: CatService, useValue: catServiceSpy },
        { provide: ExternalAttendanceService, useValue: attendanceServiceSpy },
      ],
    });
    fixture = TestBed.createComponent(ExternalAttendanceFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(() => {
    catServiceSpy = jasmine.createSpyObj<CatService>('CatService', [
      'findById',
    ]);
    attendanceServiceSpy = jasmine.createSpyObj<ExternalAttendanceService>(
      'ExternalAttendanceService',
      ['create', 'listByCat', 'attachment'],
    );
    catServiceSpy.findById.and.returnValue(of(mockCat()));
    attendanceServiceSpy.create.and.returnValue(of({} as ExternalAttendance));
  });

  it('loads the cat from the route id', () => {
    createComponent();
    expect(catServiceSpy.findById).toHaveBeenCalledWith(9);
    expect(component.cat()).toEqual(mockCat());
  });

  it('does not submit an invalid form', () => {
    createComponent();
    component.onSubmit();
    expect(attendanceServiceSpy.create).not.toHaveBeenCalled();
    expect(component.form.controls.partnerClinic.touched).toBeTrue();
  });

  it('rejects a future attendance date', () => {
    createComponent();
    component.form.controls.attendanceDate.setValue('2999-01-01');
    expect(
      component.form.controls.attendanceDate.hasError('futureDate'),
    ).toBeTrue();
  });

  it('rejects attachments larger than 5 MB', () => {
    createComponent();
    const input = fixture.nativeElement.querySelector(
      '#attachment',
    ) as HTMLInputElement;
    const file = new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'large.pdf', {
      type: 'application/pdf',
    });
    Object.defineProperty(input, 'files', { value: [file] });
    component.onFileSelected({ target: input } as unknown as Event);
    expect(component.selectedFile()).toBeNull();
    expect(component.selectedFileError()).toContain('5 MB');
  });

  it('submits the selected file with the route cat id', () => {
    createComponent();
    component.form.setValue({
      partnerClinic: ' Clínica VetAmigo ',
      veterinarian: ' Dra. Teste ',
      crmv: '12345 / MG',
      attendanceDate: '2026-10-05',
      diagnosis: ' Trauma leve ',
    });
    const file = new File(['pdf'], 'relatorio.pdf', {
      type: 'application/pdf',
    });
    component.onFileSelected({ target: { files: [file] } } as unknown as Event);

    component.onSubmit();

    expect(attendanceServiceSpy.create).toHaveBeenCalledWith(
      jasmine.objectContaining({
        catId: 9,
        partnerClinic: 'Clínica VetAmigo',
        veterinarian: 'Dra. Teste',
        crmv: '12345 / MG',
        attendanceDate: '2026-10-05',
        diagnosis: 'Trauma leve',
        file,
      }),
    );
  });

  it('shows a not-found message when the route id is invalid', () => {
    createComponent('abc');
    expect(component.loadError()).toBe('Gatinho não encontrado.');
    expect(catServiceSpy.findById).not.toHaveBeenCalled();
  });
});
