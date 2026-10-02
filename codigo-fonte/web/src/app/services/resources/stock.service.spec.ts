import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import {
  CreateStockEntryRequest,
  CreateStockItemRequest,
  PagedResult,
  StockItem,
  UpdateStockItemRequest,
} from '../../models/stock.model';
import { apiUrlInterceptor } from '../http/api-url.interceptor';
import { StockService } from './stock.service';

describe('StockService (integration)', () => {
  let service: StockService;
  let httpMock: HttpTestingController;

  function mockStockItem(): StockItem {
    return {
      id: 1,
      name: 'Amoxicilina 250mg',
      category: 'Antibiótico',
      quantity: 42,
      status: 'Normal',
      expirationDate: '2027-03-01',
      unit: 'unidades',
      notes: null,
    };
  }

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

  afterEach(() => {
    httpMock.verify();
  });

  it('fetches a page of stock items always sending page and size', () => {
    const mockPage: PagedResult<StockItem> = {
      content: [mockStockItem()],
      page: 0,
      size: 20,
      totalElements: 1,
      totalPages: 1,
    };

    let received: PagedResult<StockItem> | undefined;

    service
      .list({ page: 0, size: 20 })
      .subscribe((result) => (received = result));

    const request = httpMock.expectOne(
      `${environment.apiUrl}/stock?page=0&size=20`,
    );

    expect(request.request.method).toBe('GET');
    request.flush(mockPage);

    expect(received).toEqual(mockPage);
  });

  it('includes optional filters when provided', () => {
    service
      .list({
        search: 'amoxicilina',
        category: 'Antibiótico',
        status: 'Low',
        expirationFrom: '2026-10-01',
        expirationTo: '2027-10-01',
        page: 1,
        size: 10,
      })
      .subscribe();

    const request = httpMock.expectOne(
      `${environment.apiUrl}/stock?page=1&size=10&search=amoxicilina&category=Antibi%C3%B3tico&status=Low&expirationFrom=2026-10-01&expirationTo=2027-10-01`,
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

  it('omits optional filters when they are not provided', () => {
    service.list({ page: 0, size: 20 }).subscribe();

    const request = httpMock.expectOne(
      `${environment.apiUrl}/stock?page=0&size=20`,
    );

    expect(request.request.urlWithParams.includes('search')).toBeFalse();
    expect(request.request.urlWithParams.includes('category')).toBeFalse();
    expect(request.request.urlWithParams.includes('status')).toBeFalse();
    expect(request.request.urlWithParams.includes('expirationFrom')).toBeFalse();
    expect(request.request.urlWithParams.includes('expirationTo')).toBeFalse();

    request.flush({
      content: [],
      page: 0,
      size: 20,
      totalElements: 0,
      totalPages: 0,
    });
  });

  it('fetches a stock item by id', () => {
    let received: StockItem | undefined;

    service.findById(1).subscribe((item) => (received = item));

    const request = httpMock.expectOne(`${environment.apiUrl}/stock/1`);

    expect(request.request.method).toBe('GET');
    request.flush(mockStockItem());

    expect(received).toEqual(mockStockItem());
  });

  it('posts the payload to create a stock item', () => {
    const payload: CreateStockItemRequest = {
      name: 'Amoxicilina 250mg',
      category: 'Antibiótico',
      quantity: 0,
      unit: 'unidades',
      notes: null,
    };

    let received: StockItem | undefined;

    service.create(payload).subscribe((item) => (received = item));

    const request = httpMock.expectOne(`${environment.apiUrl}/stock`);

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);

    request.flush(mockStockItem());

    expect(received).toEqual(mockStockItem());
  });

  it('puts the payload to update a stock item', () => {
    const payload: UpdateStockItemRequest = {
      name: 'Amoxicilina 250mg',
      category: 'Antibiótico',
      quantity: 50,
      unit: 'unidades',
      notes: 'Estoque atualizado',
    };

    service.update(1, payload).subscribe();

    const request = httpMock.expectOne(`${environment.apiUrl}/stock/1`);

    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(payload);

    request.flush({
      ...mockStockItem(),
      quantity: 50,
      notes: 'Estoque atualizado',
    });
  });

  it('posts the payload to register a stock entry', () => {
    const payload: CreateStockEntryRequest = {
      stockItemId: 1,
      origin: 'DONATED',
      donorName: 'Clínica VetAmigo',
      quantity: 10,
      entryDate: '2026-09-10',
      expirationDate: '2028-04-01',
    };

    let completed = false;

    service.registerEntry(payload).subscribe({
      complete: () => (completed = true),
    });

    const request = httpMock.expectOne(
      `${environment.apiUrl}/stock/entries`,
    );

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);

    request.flush(null, {
      status: 201,
      statusText: 'Created',
    });

    expect(completed).toBeTrue();
  });
});
