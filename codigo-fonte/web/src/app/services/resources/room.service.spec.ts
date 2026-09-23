import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { CreateRoomRequest, Room, UpdateRoomRequest } from '../../models/room.model';
import { PagedResult } from '../../models/user.model';
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
      title: 'Sala 1 — Adultos',
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
    service.list({ search: 'adultos', active: false, page: 1, size: 10 }).subscribe();

    const request = httpMock.expectOne(
      `${environment.apiUrl}/rooms?page=1&size=10&search=adultos&active=false`,
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

  it('fetches a single room by id', () => {
    let received: Room | undefined;
    service.findById(1).subscribe((room) => (received = room));

    const request = httpMock.expectOne(`${environment.apiUrl}/rooms/1`);
    expect(request.request.method).toBe('GET');
    request.flush(mockRoom());

    expect(received).toEqual(mockRoom());
  });

  it('posts the payload to create a room', () => {
    const payload: CreateRoomRequest = {
      title: 'Sala 8 — Filhotes',
      description: null,
      maxCapacity: 6,
    };
    let received: Room | undefined;
    service.create(payload).subscribe((room) => (received = room));

    const request = httpMock.expectOne(`${environment.apiUrl}/rooms`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush(mockRoom());

    expect(received).toEqual(mockRoom());
  });

  it('puts the payload to update a room', () => {
    const payload: UpdateRoomRequest = {
      title: 'Sala 1 — Adultos Renomeada',
      description: 'Atualizada',
      maxCapacity: 10,
    };
    service.update(7, payload).subscribe();

    const request = httpMock.expectOne(`${environment.apiUrl}/rooms/7`);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(payload);
    request.flush(mockRoom());
  });

  it('sends a PATCH with active=false to deactivate a room', () => {
    let completed = false;
    service.deactivate(7).subscribe(() => (completed = true));

    const request = httpMock.expectOne(`${environment.apiUrl}/rooms/7/status`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({ active: false });
    request.flush(null, { status: 204, statusText: 'No Content' });

    expect(completed).toBeTrue();
  });

  it('sends a PATCH with active=true to reactivate a room', () => {
    let completed = false;
    service.activate(7).subscribe(() => (completed = true));

    const request = httpMock.expectOne(`${environment.apiUrl}/rooms/7/status`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({ active: true });
    request.flush(null, { status: 204, statusText: 'No Content' });

    expect(completed).toBeTrue();
  });

  it('puts the file as multipart form data to upload a photo', () => {
    const file = new File(['x'], 'foto.png', { type: 'image/png' });
    service.uploadPhoto(7, file).subscribe();

    const request = httpMock.expectOne(`${environment.apiUrl}/rooms/7/photo`);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body instanceof FormData).toBeTrue();
    expect((request.request.body as FormData).get('file')).toBe(file);
    request.flush(mockRoom());
  });

  it('fetches the photo as a blob', () => {
    let received: Blob | undefined;
    service.photo(7).subscribe((blob) => (received = blob));

    const request = httpMock.expectOne(`${environment.apiUrl}/rooms/7/photo`);
    expect(request.request.method).toBe('GET');
    expect(request.request.responseType).toBe('blob');
    request.flush(new Blob(['x']));

    expect(received instanceof Blob).toBeTrue();
  });

  it('deletes the photo', () => {
    service.removePhoto(7).subscribe();

    const request = httpMock.expectOne(`${environment.apiUrl}/rooms/7/photo`);
    expect(request.request.method).toBe('DELETE');
    request.flush(null, { status: 204, statusText: 'No Content' });
  });
});
