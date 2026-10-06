import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { CreateExternalAttendanceRequest } from '../../models/external-attendance.model';
import { ExternalAttendanceService } from './external-attendance.service';

describe('ExternalAttendanceService', () => {
  let service: ExternalAttendanceService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ExternalAttendanceService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(ExternalAttendanceService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('posts the attendance and file as multipart form data', () => {
    const file = new File(['pdf'], 'relatorio.pdf', {
      type: 'application/pdf',
    });
    const request: CreateExternalAttendanceRequest = {
      catId: 7,
      partnerClinic: 'Clínica VetAmigo',
      veterinarian: 'Dra. Teste',
      crmv: '12345 / MG',
      attendanceDate: '2026-10-05',
      diagnosis: 'Trauma leve',
      file,
    };

    service.create(request).subscribe();

    const req = httpMock.expectOne(
      `${environment.apiUrl}/cats/7/external-attendances`,
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBeTrue();
    const body = req.request.body as FormData;
    expect(body.get('file')).toBe(file);
    expect(body.get('data')).toEqual(jasmine.any(Blob));
    expect((body.get('data') as Blob).type).toBe('application/json');
    req.flush({});
  });

  it('lists external attendances by cat', () => {
    service.listByCat(7).subscribe();
    const req = httpMock.expectOne(
      `${environment.apiUrl}/cats/7/external-attendances`,
    );
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });
});
