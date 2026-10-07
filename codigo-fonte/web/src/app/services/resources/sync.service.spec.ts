import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { SyncDevice } from '../../models/sync.model';
import { apiUrlInterceptor } from '../http/api-url.interceptor';
import { SyncService } from './sync.service';

describe('SyncService (integration)', () => {
  let service: SyncService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([apiUrlInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(SyncService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('fetches the synchronization devices', () => {
    const devices: SyncDevice[] = [
      {
        deviceId: 'device-1',
        deviceName: 'Galaxy',
        platform: 'android',
        appVersion: '1.0.0',
        userId: 3,
        userName: 'Pedro Lima',
        accessType: 'Assistant',
        userActive: true,
        pendingCount: 3,
        rejectedCount: 0,
        lastSyncAt: '2026-10-03T10:00:00',
        lastSeenAt: '2026-10-03T10:05:00',
        status: 'Pending',
      },
    ];
    let result: SyncDevice[] | undefined;

    service.listDevices().subscribe((value) => (result = value));

    const request = httpMock.expectOne(`${environment.apiUrl}/sync/devices`);
    expect(request.request.method).toBe('GET');
    request.flush(devices);

    expect(result).toEqual(devices);
  });
});
