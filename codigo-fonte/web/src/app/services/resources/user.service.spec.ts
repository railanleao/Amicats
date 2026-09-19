import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { User } from '../../models/user.model';
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

  it('fetches the user list from the configured API URL', () => {
    const mockUsers: User[] = [
      {
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
      },
    ];

    let received: User[] | undefined;
    service.list().subscribe((users) => (received = users));

    const request = httpMock.expectOne(`${environment.apiUrl}/users`);
    expect(request.request.method).toBe('GET');
    request.flush(mockUsers);

    expect(received).toEqual(mockUsers);
  });

  it('sends a PATCH to deactivate a user', () => {
    let completed = false;
    service.deactivate(7).subscribe(() => (completed = true));

    const request = httpMock.expectOne(`${environment.apiUrl}/users/7`);
    expect(request.request.method).toBe('PATCH');
    request.flush(null, { status: 204, statusText: 'No Content' });

    expect(completed).toBeTrue();
  });
});
