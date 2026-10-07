import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { SyncDevice } from '../../models/sync.model';
import { SyncService } from '../../services/resources/sync.service';
import { SyncComponent } from './sync.component';

function device(overrides: Partial<SyncDevice> = {}): SyncDevice {
  return {
    deviceId: 'device-1',
    deviceName: 'Galaxy',
    platform: 'android',
    appVersion: '1.0.0',
    userId: 3,
    userName: 'Pedro Lima',
    accessType: 'Assistant',
    userActive: true,
    pendingCount: 0,
    rejectedCount: 0,
    lastSyncAt: new Date().toISOString(),
    lastSeenAt: new Date().toISOString(),
    status: 'Synchronized',
    ...overrides,
  };
}

describe('SyncComponent (unit)', () => {
  let fixture: ComponentFixture<SyncComponent>;
  let component: SyncComponent;
  let syncServiceSpy: jasmine.SpyObj<SyncService>;

  async function setup(devices: SyncDevice[]): Promise<void> {
    syncServiceSpy = jasmine.createSpyObj<SyncService>('SyncService', [
      'listDevices',
    ]);
    syncServiceSpy.listDevices.and.returnValue(of(devices));

    await TestBed.configureTestingModule({
      imports: [SyncComponent],
      providers: [{ provide: SyncService, useValue: syncServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(SyncComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  function rows(): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.device-row'));
  }

  it('loads the devices on init and records when they were checked', async () => {
    await setup([device()]);

    expect(syncServiceSpy.listDevices).toHaveBeenCalledTimes(1);
    expect(component.devices().length).toBe(1);
    expect(component.checkedAt()).not.toBeNull();
    expect(rows().length).toBe(1);
  });

  it('shows device, user, profile and the synchronized badge', async () => {
    await setup([device()]);

    const text = rows()[0].textContent ?? '';
    expect(text).toContain('Galaxy');
    expect(text).toContain('Pedro Lima');
    expect(text).toContain('Assistente');
    expect(text).toContain('Sincronizado');
  });

  it('marks pending devices and shows the pending count', async () => {
    await setup([device({ pendingCount: 3, status: 'Pending' })]);

    expect(component.statusView(component.devices()[0])).toEqual({
      label: 'Pendente',
      tone: 'warning',
    });
    expect(rows()[0].textContent).toContain('3');
  });

  it('flags devices with rejected records', async () => {
    const rejected = device({
      pendingCount: 1,
      rejectedCount: 2,
      status: 'Pending',
    });
    await setup([rejected]);

    expect(component.statusView(rejected)).toEqual({
      label: 'Com recusas',
      tone: 'danger',
    });
    expect(component.pendingLabel(rejected)).toBe('1 · 2 recusado(s)');
  });

  it('labels inactive users and unnamed devices', async () => {
    const unnamed = device({
      deviceName: null,
      platform: null,
      userActive: false,
    });
    await setup([unnamed]);

    expect(component.deviceTitle(unnamed)).toBe('Dispositivo');
    expect(component.profileLabel(unnamed)).toBe('Assistente (inativo)');
  });

  it('filters by device or user name', async () => {
    await setup([
      device({ deviceId: 'a', deviceName: 'Galaxy', userName: 'Pedro Lima' }),
      device({
        deviceId: 'b',
        deviceName: 'iPhone',
        userName: 'Juliana Torres',
      }),
    ]);

    component.onSearch({ target: { value: 'juli' } } as unknown as Event);
    fixture.detectChanges();

    expect(component.filteredDevices().map((d) => d.deviceId)).toEqual(['b']);
    expect(rows().length).toBe(1);

    component.onSearch({ target: { value: 'galaxy' } } as unknown as Event);
    expect(component.filteredDevices().map((d) => d.deviceId)).toEqual(['a']);

    component.onSearch({ target: { value: '' } } as unknown as Event);
    expect(component.filteredDevices().length).toBe(2);
  });

  it('shows an empty state when nothing matches', async () => {
    await setup([device()]);

    component.onSearch({ target: { value: 'zzz' } } as unknown as Event);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(
      'Nenhum dispositivo encontrado.',
    );
  });

  it('shows an error with a retry action when loading fails', async () => {
    await setup([]);
    syncServiceSpy.listDevices.and.returnValue(
      throwError(() => new Error('x')),
    );

    component.loadDevices();
    fixture.detectChanges();

    expect(component.errorMessage()).toBe(
      'Não foi possível carregar os dispositivos. Tente novamente.',
    );
    expect(component.loading()).toBeFalse();
    expect(
      fixture.nativeElement.querySelector('.feedback__retry'),
    ).not.toBeNull();
  });

  it('clears the error when a retry succeeds', async () => {
    await setup([]);
    syncServiceSpy.listDevices.and.returnValue(
      throwError(() => new Error('x')),
    );
    component.loadDevices();

    syncServiceSpy.listDevices.and.returnValue(of([device()]));
    component.loadDevices();

    expect(component.errorMessage()).toBeNull();
    expect(component.devices().length).toBe(1);
  });
});
