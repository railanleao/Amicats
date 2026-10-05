import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { apiUrlInterceptor } from '../http/api-url.interceptor';
import { PrescribedMedicationService } from './prescribed-medication.service';

describe('PrescribedMedicationService (integration)', () => {
  let service: PrescribedMedicationService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([apiUrlInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(PrescribedMedicationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('fetches the active medications of a cat', () => {
    service.listActive(9).subscribe();

    const request = httpMock.expectOne(
      `${environment.apiUrl}/cats/9/prescribed-medications/active`,
    );
    expect(request.request.method).toBe('GET');

    request.flush([]);
  });
});
