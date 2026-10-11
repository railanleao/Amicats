import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { apiUrlInterceptor } from '../http/api-url.interceptor';
import { HealthProcedureService } from './health-procedure.service';

describe('HealthProcedureService (integration)', () => {
  let service: HealthProcedureService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/health-procedures`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([apiUrlInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(HealthProcedureService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('lists with only the filters that were given', () => {
    service.list({ page: 0, size: 20 }).subscribe();

    const req = httpMock.expectOne((request) => request.url === baseUrl);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.keys()).toEqual(['page', 'size']);
    req.flush({
      content: [],
      page: 0,
      size: 20,
      totalElements: 0,
      totalPages: 0,
    });
  });

  it('sends every filter as a query param', () => {
    service
      .list({
        page: 1,
        size: 10,
        search: 'tob',
        catId: 2,
        type: 'Vaccine',
        status: 'Scheduled',
      })
      .subscribe();

    const req = httpMock.expectOne((request) => request.url === baseUrl);
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('size')).toBe('10');
    expect(req.request.params.get('search')).toBe('tob');
    expect(req.request.params.get('catId')).toBe('2');
    expect(req.request.params.get('type')).toBe('Vaccine');
    expect(req.request.params.get('status')).toBe('Scheduled');
    req.flush({
      content: [],
      page: 1,
      size: 10,
      totalElements: 0,
      totalPages: 0,
    });
  });

  it('finds a procedure by id', () => {
    service.findById(7).subscribe();

    const req = httpMock.expectOne(`${baseUrl}/7`);
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('lists the changes of a procedure', () => {
    service.listChanges(7).subscribe();

    const req = httpMock.expectOne(`${baseUrl}/7/changes`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('summarizes the health of a cat', () => {
    service.summarize(2).subscribe();

    const req = httpMock.expectOne(
      `${environment.apiUrl}/cats/2/health-summary`,
    );
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('creates a procedure', () => {
    const request = {
      catId: 2,
      type: 'Vaccine' as const,
      name: 'Antirrábica',
      scheduledDate: '2026-10-20',
      notes: null,
    };

    service.create(request).subscribe();

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush({});
  });

  it('updates a procedure', () => {
    const request = { name: 'V4', scheduledDate: '2026-10-25', notes: null };

    service.update(7, request).subscribe();

    const req = httpMock.expectOne(`${baseUrl}/7`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(request);
    req.flush({});
  });

  it('completes a procedure', () => {
    const request = {
      completedDate: '2026-10-09',
      notes: null,
      boosterDate: '2027-10-09',
    };

    service.complete(7, request).subscribe();

    const req = httpMock.expectOne(`${baseUrl}/7/complete`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(request);
    req.flush({});
  });

  it('cancels a procedure', () => {
    service.cancel(7, { reason: 'Óbito' }).subscribe();

    const req = httpMock.expectOne(`${baseUrl}/7/cancel`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ reason: 'Óbito' });
    req.flush({});
  });
});
