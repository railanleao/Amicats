import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { PagedResult, Room } from '../../models/room.model';
import { apiUrlInterceptor } from '../http/api-url.interceptor';
import { RoomService } from './room.service';

describe('RoomService (integration)', () => {
  let service: RoomService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([apiUrlInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(RoomService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  function mockRoom(): Room {
    return {
      id: 1,
      title: 'Quarentena',
      description: null,
      coverImageUrl: null,
      maxCapacity: 8,
      active: true,
    };
  }

  it('fetches a page of rooms always sending page and size', () => {
    const mockPage: PagedResult<Room> = {
      content: [mockRoom()],
      page: 0,
      size: 20,
      totalElements: 1,
      totalPages: 1,
    };

    let received: PagedResult<Room> | undefined;
    service.list({ page: 0, size: 20 }).subscribe((result) => (received = result));

    const request = httpMock.expectOne(`${environment.apiUrl}/rooms?page=0&size=20`);
    expect(request.request.method).toBe('GET');
    request.flush(mockPage);

    expect(received).toEqual(mockPage);
  });

  it('includes search and active only when provided', () => {
    service.list({ search: 'quarentena', active: true, page: 1, size: 10 }).subscribe();

    const request = httpMock.expectOne(
      `${environment.apiUrl}/rooms?page=1&size=10&search=quarentena&active=true`,
    );
    expect(request.request.method).toBe('GET');
    request.flush({ content: [], page: 1, size: 10, totalElements: 0, totalPages: 0 });
  });

  it('omits search and active when not provided', () => {
    service.list({ page: 0, size: 20 }).subscribe();

    const request = httpMock.expectOne(`${environment.apiUrl}/rooms?page=0&size=20`);
    expect(request.request.url.includes('search')).toBeFalse();
    expect(request.request.url.includes('active')).toBeFalse();
    request.flush({ content: [], page: 0, size: 20, totalElements: 0, totalPages: 0 });
  });
});
