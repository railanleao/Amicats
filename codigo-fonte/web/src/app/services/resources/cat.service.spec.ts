import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { Cat, PagedResult } from '../../models/cat.model';
import { apiUrlInterceptor } from '../http/api-url.interceptor';
import { CatService } from './cat.service';

describe('CatService (integration)', () => {
  let service: CatService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([apiUrlInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(CatService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  function mockCat(): Cat {
    return {
      id: 1,
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
    };
  }

  it('fetches a page of cats always sending page and size', () => {
    const mockPage: PagedResult<Cat> = {
      content: [mockCat()],
      page: 0,
      size: 20,
      totalElements: 1,
      totalPages: 1,
    };

    let received: PagedResult<Cat> | undefined;
    service
      .list({ page: 0, size: 20 })
      .subscribe((result) => (received = result));

    const request = httpMock.expectOne(
      `${environment.apiUrl}/cats?page=0&size=20`,
    );
    expect(request.request.method).toBe('GET');
    request.flush(mockPage);

    expect(received).toEqual(mockPage);
  });

  it('includes search, roomId and generalStatus only when provided', () => {
    service
      .list({
        search: 'nina',
        roomId: 2,
        generalStatus: 'InClinic',
        page: 1,
        size: 10,
      })
      .subscribe();

    const request = httpMock.expectOne(
      `${environment.apiUrl}/cats?page=1&size=10&search=nina&roomId=2&generalStatus=InClinic`,
    );
    expect(request.request.method).toBe('GET');
    request.flush({
      content: [],
      page: 1,
      size: 10,
      totalElements: 0,
      totalPages: 0,
    });
  });

  it('omits search, roomId and generalStatus when not provided', () => {
    service.list({ page: 0, size: 20 }).subscribe();

    const request = httpMock.expectOne(
      `${environment.apiUrl}/cats?page=0&size=20`,
    );
    expect(request.request.url.includes('search')).toBeFalse();
    expect(request.request.url.includes('roomId')).toBeFalse();
    expect(request.request.url.includes('generalStatus')).toBeFalse();
    request.flush({
      content: [],
      page: 0,
      size: 20,
      totalElements: 0,
      totalPages: 0,
    });
  });

  it('fetches the photo as a blob', () => {
    let received: Blob | undefined;
    service.photo(7).subscribe((blob) => (received = blob));

    const request = httpMock.expectOne(`${environment.apiUrl}/cats/7/photo`);
    expect(request.request.method).toBe('GET');
    expect(request.request.responseType).toBe('blob');
    request.flush(new Blob(['x']));

    expect(received instanceof Blob).toBeTrue();
  });
});
