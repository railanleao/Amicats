import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { CreateInternalMedicalPrescriptionRequest } from '../../models/medical-prescription.model';
import { apiUrlInterceptor } from '../http/api-url.interceptor';
import { InternalMedicalPrescriptionService } from './internal-medical-prescription.service';

describe('InternalMedicalPrescriptionService (integration)', () => {
  let service: InternalMedicalPrescriptionService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([apiUrlInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(InternalMedicalPrescriptionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('posts the internal prescription to the cat', () => {
    const body: CreateInternalMedicalPrescriptionRequest = {
      title: 'Reavaliação de FIV+',
      notes: null,
      medication: null,
    };

    service.create(9, body).subscribe();

    const request = httpMock.expectOne(
      `${environment.apiUrl}/cats/9/internal-medical-prescriptions`,
    );
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(body);

    request.flush({});
  });
});
