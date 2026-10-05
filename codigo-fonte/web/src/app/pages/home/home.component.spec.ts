import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { Cat, GeneralStatus, PagedResult } from '../../models/cat.model';
import { Room } from '../../models/room.model';
import { StockItem } from '../../models/stock.model';
import { AuthService } from '../../services/resources/auth.service';
import { CatService } from '../../services/resources/cat.service';
import { RoomService } from '../../services/resources/room.service';
import { StockService } from '../../services/resources/stock.service';
import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let fixture: ComponentFixture<HomeComponent>;
  let component: HomeComponent;
  let catServiceSpy: jasmine.SpyObj<CatService>;
  let roomServiceSpy: jasmine.SpyObj<RoomService>;
  let stockServiceSpy: jasmine.SpyObj<StockService>;

  function pagedCats(totalElements: number, content: Cat[] = []): PagedResult<Cat> {
    return { content, page: 0, size: 1, totalElements, totalPages: totalElements > 0 ? 1 : 0 };
  }

  function pagedRooms(content: Room[]): PagedResult<Room> {
    return { content, page: 0, size: 20, totalElements: content.length, totalPages: 1 };
  }

  function pagedStock(content: StockItem[]): PagedResult<StockItem> {
    return { content, page: 0, size: 5, totalElements: content.length, totalPages: content.length > 0 ? 1 : 0 };
  }

  function aRoom(overrides: Partial<Room> = {}): Room {
    return {
      id: 1,
      title: 'Sala 1',
      description: null,
      coverImageUrl: null,
      maxCapacity: 10,
      active: true,
      ...overrides,
    };
  }

  function aStockItem(overrides: Partial<StockItem> = {}): StockItem {
    return {
      id: 1,
      name: 'Amoxicilina',
      category: 'Antibiótico',
      quantity: 2,
      status: 'Low',
      expirationDate: null,
      unit: 'comprimidos',
      notes: null,
      ...overrides,
    };
  }

  function createComponent(userName: string | null): void {
    const authServiceSpy = jasmine.createSpyObj<AuthService>(
      'AuthService',
      [],
      {
        currentUser: signal(
          userName
            ? { id: 1, name: userName, accessType: 'Administrator' }
            : null,
        ),
      },
    );

    TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceSpy },
        { provide: CatService, useValue: catServiceSpy },
        { provide: RoomService, useValue: roomServiceSpy },
        { provide: StockService, useValue: stockServiceSpy },
      ],
    });

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(() => {
    catServiceSpy = jasmine.createSpyObj<CatService>('CatService', ['list']);
    roomServiceSpy = jasmine.createSpyObj<RoomService>('RoomService', ['list']);
    stockServiceSpy = jasmine.createSpyObj<StockService>('StockService', ['list']);

    // Defaults: no cats, no rooms, no stock — overridden per test as needed.
    catServiceSpy.list.and.returnValue(of(pagedCats(0)));
    roomServiceSpy.list.and.returnValue(of(pagedRooms([])));
    stockServiceSpy.list.and.returnValue(of(pagedStock([])));
  });

  it('greets the logged-in user by their first name', () => {
    createComponent('Camila Andrade');

    expect(component.firstName()).toBe('Camila');
    expect(
      fixture.nativeElement.querySelector('.greeting-title').textContent,
    ).toContain('Camila');
  });

  it('does not blow up when there is no logged-in user yet', () => {
    createComponent(null);

    expect(component.firstName()).toBe('');
  });

  it('renders one card per stat, quick action, reminder and room', () => {
    createComponent('Camila Andrade');

    expect(fixture.nativeElement.querySelectorAll('.stat-card').length).toBe(
      component.stats().length,
    );
    // +1 for the "+ Novo gatinho" link, which isn't in the mock quickActions array.
    expect(fixture.nativeElement.querySelectorAll('.quick-action').length).toBe(
      component.quickActions.length + 1,
    );
    expect(fixture.nativeElement.querySelectorAll('.reminder-row').length).toBe(
      component.reminders.length,
    );
    expect(
      fixture.nativeElement.querySelectorAll('.occupancy-row').length,
    ).toBe(component.roomOccupancy().length);
    // +1 for the header row.
    expect(fixture.nativeElement.querySelectorAll('.activity-row').length).toBe(
      component.activity.length + 1,
    );
  });

  it('computes the occupancy percentage from occupied/capacity', () => {
    createComponent('Camila Andrade');

    expect(
      component.occupancyPercent({
        name: 'x',
        occupied: 14,
        capacity: 16,
        tone: 'primary',
      }),
    ).toBe(88);
  });

  it('builds initials the same way the shared avatar does, with the same edge cases', () => {
    createComponent('Camila Andrade');

    expect(component.initialsOf('Juliana Torres')).toBe('JT');
    expect(component.initialsOf('Camila')).toBe('C');
    expect(component.initialsOf('   ')).toBe('?');
  });

  it('computes "Gatinhos ativos" as total minus adopted and deceased', () => {
    catServiceSpy.list.and.callFake((params) => {
      const status = params.generalStatus as GeneralStatus | undefined;
      if (status === 'Adopted') return of(pagedCats(3));
      if (status === 'Deceased') return of(pagedCats(1));
      if (status === 'AvailableForAdoption') return of(pagedCats(5));
      return of(pagedCats(20));
    });

    createComponent('Camila Andrade');

    expect(component.stats()[0]).toEqual({ value: '16', label: 'Gatinhos ativos' });
    expect(component.stats()[1]).toEqual({
      value: '5',
      label: 'Disponíveis para adoção',
    });
  });

  it('aggregates room occupancy across active rooms and keeps only the top 3', () => {
    const rooms = [
      aRoom({ id: 1, title: 'Sala A', maxCapacity: 10 }),
      aRoom({ id: 2, title: 'Sala B', maxCapacity: 4 }),
      aRoom({ id: 3, title: 'Sala C', maxCapacity: 8 }),
      aRoom({ id: 4, title: 'Sala D', maxCapacity: 5 }),
    ];
    roomServiceSpy.list.and.returnValue(of(pagedRooms(rooms)));
    catServiceSpy.list.and.callFake((params) => {
      if (params.roomId === 1) return of(pagedCats(5)); // 50%
      if (params.roomId === 2) return of(pagedCats(4)); // 100%
      if (params.roomId === 3) return of(pagedCats(2)); // 25%
      if (params.roomId === 4) return of(pagedCats(4)); // 80%
      return of(pagedCats(0));
    });

    createComponent('Camila Andrade');

    const occupancy = component.roomOccupancy();
    expect(occupancy.length).toBe(3);
    expect(occupancy.map((r) => r.name)).toEqual(['Sala B', 'Sala D', 'Sala A']);

    const totalCapacity = 10 + 4 + 8 + 5;
    const totalOccupied = 5 + 4 + 2 + 4;
    const expectedPercent = Math.round((totalOccupied / totalCapacity) * 100);
    expect(component.stats()[2]).toEqual({
      value: `${expectedPercent}%`,
      label: 'Ocupação das salas',
    });
  });

  it('skips rooms without a maxCapacity when computing occupancy', () => {
    roomServiceSpy.list.and.returnValue(
      of(pagedRooms([aRoom({ id: 1, maxCapacity: null })])),
    );

    createComponent('Camila Andrade');

    expect(component.roomOccupancy()).toEqual([]);
    expect(component.stats()[2].value).toBe('0%');
  });

  it('sums low and out-of-stock items into "Medicamentos em falta"', () => {
    stockServiceSpy.list.and.callFake((params) => {
      if (params.status === 'Low') return of(pagedStock([aStockItem({ id: 1 })]));
      if (params.status === 'OutOfStock') return of(pagedStock([]));
      return of(pagedStock([]));
    });

    createComponent('Camila Andrade');

    expect(component.stats()[3]).toEqual({
      value: '1',
      label: 'Medicamentos em falta',
      tone: 'danger',
    });
  });

  it('omits the danger tone and the extra reminder when nothing is low on stock', () => {
    createComponent('Camila Andrade');

    expect(component.stats()[3].tone).toBeUndefined();
    expect(component.stockReminder()).toBeNull();
  });

  it('builds the stock reminder from the most urgent item, preferring out-of-stock', () => {
    stockServiceSpy.list.and.callFake((params) => {
      if (params.status === 'OutOfStock') {
        return of(pagedStock([aStockItem({ name: 'Doramectina', quantity: 0, unit: 'ml' })]));
      }
      return of(pagedStock([aStockItem({ name: 'Amoxicilina', quantity: 2 })]));
    });

    createComponent('Camila Andrade');

    expect(component.stockReminder()).toEqual({
      date: 'Hoje',
      text: 'Estoque baixo — Doramectina, 0 ml',
      tone: 'danger',
    });
  });

  it('degrades gracefully when a dashboard request fails', () => {
    catServiceSpy.list.and.returnValue(throwError(() => new Error('network error')));
    roomServiceSpy.list.and.returnValue(throwError(() => new Error('network error')));
    stockServiceSpy.list.and.returnValue(throwError(() => new Error('network error')));

    expect(() => createComponent('Camila Andrade')).not.toThrow();

    expect(component.stats()[0]).toEqual({ value: '0', label: 'Gatinhos ativos' });
    expect(component.roomOccupancy()).toEqual([]);
    expect(component.stockReminder()).toBeNull();
  });
});
