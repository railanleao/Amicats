import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import {
  CreateStockEntryRequest,
  CreateStockItemRequest,
  MEDICATION_CATEGORY,
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

  afterEach(() => httpMock.verify());



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

  it('lists stock items filtered by category and search', () => {
    service
      .list({
        category: 'Medicamento',
        search: 'inter',
        page: 0,
        size: 10,
      })
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
     (req) => req.url === `${environment.apiUrl}/stock`,
   );

   expect(request.request.method).toBe('GET');
   expect(request.request.params.get('search')).toBe('amoxicilina');
   expect(request.request.params.get('category')).toBe('Antibiótico');
   expect(request.request.params.get('status')).toBe('Low');
   expect(request.request.params.get('expirationFrom')).toBe('2026-10-01');
   expect(request.request.params.get('expirationTo')).toBe('2027-10-01');
   expect(request.request.params.get('page')).toBe('1');
   expect(request.request.params.get('size')).toBe('10');

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
      (req) => req.url === `${environment.apiUrl}/stock`,
    );

    expect(request.request.params.has('category')).toBeFalse();
    expect(request.request.params.has('search')).toBeFalse();
    expect(request.request.params.has('status')).toBeFalse();
    expect(request.request.params.has('expirationFrom')).toBeFalse();
    expect(request.request.params.has('expirationTo')).toBeFalse();

    request.flush({
      content: [],
      page: 0,
      size: 20,
      totalElements: 0,
      totalPages: 0,
    });
  });

  it('fetches a stock item by id', () => {
    const item = mockStockItem();

    let received: StockItem | undefined;

    service.findById(item.id).subscribe((result) => {
      received = result;
    });

    const request = httpMock.expectOne(
      `${environment.apiUrl}/stock/${item.id}`,
    );

    expect(request.request.method).toBe('GET');

    request.flush(item);

    expect(received).toEqual(item);
  });

  it('posts the payload to create a stock item', () => {
    const payload: CreateStockItemRequest = {
      name: 'Dipirona 500mg',
      category: MEDICATION_CATEGORY,
      quantity: 0,
      unit: 'frascos',
      notes: null,
    };

    const createdItem: StockItem = {
      id: 10,
      name: 'Dipirona 500mg',
      category: MEDICATION_CATEGORY,
      quantity: 0,
      status: 'OutOfStock',
      expirationDate: null,
      unit: 'frascos',
      notes: null,
    };

    let received: StockItem | undefined;

    service.create(payload).subscribe((result) => {
      received = result;
    });

    const request = httpMock.expectOne(
      `${environment.apiUrl}/stock`,
    );

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);

    request.flush(createdItem);

    expect(received).toEqual(createdItem);
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
