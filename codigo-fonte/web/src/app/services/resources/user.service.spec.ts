import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { PagedResult, User } from '../../models/user.model';
import { apiUrlInterceptor } from '../http/api-url.interceptor';
import { UserService } from './user.service';

describe('UserService (integration)', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([apiUrlInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  function mockUser(): User {
    return {
      id: 1,
      fullName: 'Marina Alves',
      email: 'marina.alves@amicats.org.br',
      phoneNumber: null,
      imageUrl: null,
      accessType: 'Assistant',
      crmv: null,
      ufCrmv: null,
      active: true,
      createdAt: '2026-01-01T00:00:00',
    };
  }

  it('fetches a page of users always sending page and size', () => {
    const mockPage: PagedResult<User> = {
      content: [mockUser()],
      page: 0,
      size: 20,
      totalElements: 1,
      totalPages: 1,
    };

    let received: PagedResult<User> | undefined;
    service.list({ page: 0, size: 20 }).subscribe((result) => (received = result));

    const request = httpMock.expectOne(
      `${environment.apiUrl}/users?page=0&size=20`,
    );
    expect(request.request.method).toBe('GET');
    request.flush(mockPage);

    expect(received).toEqual(mockPage);
  });

  it('includes search, accessType and active only when provided', () => {
    service
      .list({ search: 'carla', accessType: 'Veterinarian', active: false, page: 1, size: 10 })
      .subscribe();

    const request = httpMock.expectOne(
      `${environment.apiUrl}/users?page=1&size=10&search=carla&accessType=Veterinarian&active=false`,
    );
    expect(request.request.method).toBe('GET');
    request.flush({ content: [], page: 1, size: 10, totalElements: 0, totalPages: 0 });
  });

  it('omits search, accessType and active when not provided', () => {
    service.list({ page: 0, size: 20 }).subscribe();

    const request = httpMock.expectOne(
      `${environment.apiUrl}/users?page=0&size=20`,
    );
    expect(request.request.url.includes('search')).toBeFalse();
    expect(request.request.url.includes('accessType')).toBeFalse();
    expect(request.request.url.includes('active')).toBeFalse();
    request.flush({ content: [], page: 0, size: 20, totalElements: 0, totalPages: 0 });
  });

  it('sends a PATCH with active=false to deactivate a user', () => {
    let completed = false;
    service.deactivate(7).subscribe(() => (completed = true));

    const request = httpMock.expectOne(`${environment.apiUrl}/users/7/status`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({ active: false });
    request.flush(null, { status: 204, statusText: 'No Content' });

    expect(completed).toBeTrue();
  });

  it('sends a PATCH with active=true to reactivate a user', () => {
    let completed = false;
    service.activate(7).subscribe(() => (completed = true));

    const request = httpMock.expectOne(`${environment.apiUrl}/users/7/status`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({ active: true });
    request.flush(null, { status: 204, statusText: 'No Content' });

    expect(completed).toBeTrue();
  });
});
