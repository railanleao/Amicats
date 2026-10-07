import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { apiUrlInterceptor } from '../http/api-url.interceptor';
import { StockService } from './stock.service';

describe('StockService (integration)', () => {
  let service: StockService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([apiUrlInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(StockService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('lists stock items filtered by category and search', () => {
    service
      .list({ category: 'Medicamento', search: 'inter', page: 0, size: 10 })
      .subscribe();

    const request = httpMock.expectOne(
      (req) => req.url === `${environment.apiUrl}/stock`,
    );
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('category')).toBe('Medicamento');
    expect(request.request.params.get('search')).toBe('inter');
    expect(request.request.params.get('page')).toBe('0');
    expect(request.request.params.get('size')).toBe('10');

    request.flush({
      content: [],
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
    });
  });

  it('omits the optional filters when they are not informed', () => {
    service.list({ page: 0, size: 20 }).subscribe();

    const request = httpMock.expectOne(
      (req) => req.url === `${environment.apiUrl}/stock`,
    );
    expect(request.request.params.has('category')).toBeFalse();
    expect(request.request.params.has('search')).toBeFalse();

    request.flush({
      content: [],
      page: 0,
      size: 20,
      totalElements: 0,
      totalPages: 0,
    });
  });
});
