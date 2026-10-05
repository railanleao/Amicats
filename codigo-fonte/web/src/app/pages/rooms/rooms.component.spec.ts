import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Subject, throwError } from 'rxjs';

import { Room, RoomSearchParams } from '../../models/room.model';
import { PagedResult } from '../../models/user.model';
import { RoomService } from '../../services/resources/room.service';
import { RoomsComponent } from './rooms.component';

describe('RoomsComponent (unit)', () => {
  let fixture: ComponentFixture<RoomsComponent>;
  let component: RoomsComponent;
  let roomServiceSpy: jasmine.SpyObj<RoomService>;

  function mockRooms(): Room[] {
    return [
      {
        id: 1,
        title: 'Sala 1 — Adultos',
        description: null,
        coverImageUrl: null,
        maxCapacity: 8,
        active: true,
      },
      {
        id: 2,
        title: 'Sala 2 — Filhotes',
        description: null,
        coverImageUrl: null,
        maxCapacity: null,
        active: false,
      },
    ];
  }

  function pagedResult(
    content: Room[],
    page = 0,
    totalPages = 1,
  ): PagedResult<Room> {
    return {
      content,
      page,
      size: 20,
      totalElements: content.length,
      totalPages,
    };
  }

  beforeEach(async () => {
    roomServiceSpy = jasmine.createSpyObj<RoomService>('RoomService', [
      'list',
      'deactivate',
      'activate',
    ]);
    roomServiceSpy.list.and.returnValue(new Subject<PagedResult<Room>>());

    await TestBed.configureTestingModule({
      imports: [RoomsComponent],
      providers: [
        provideRouter([]),
        { provide: RoomService, useValue: roomServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RoomsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function latestListSubject(): Subject<PagedResult<Room>> {
    return roomServiceSpy.list.calls.mostRecent().returnValue as Subject<
      PagedResult<Room>
    >;
  }

  it('loads the room list on init with the default page and size', () => {
    expect(roomServiceSpy.list).toHaveBeenCalledWith({
      search: undefined,
      active: undefined,
      page: 0,
      size: component.pageSize,
    } as RoomSearchParams);
  });

  it('populates the list, total elements and total pages once the request resolves', () => {
    const subject = latestListSubject();

    subject.next(pagedResult(mockRooms(), 0, 3));
    subject.complete();

    expect(component.rooms()).toEqual(mockRooms());
    expect(component.totalElements()).toBe(mockRooms().length);
    expect(component.totalPages()).toBe(3);
    expect(component.loading()).toBeFalse();
  });

  it('shows an error message when the list request fails', () => {
    roomServiceSpy.list.and.returnValue(
      throwError(() => new Error('network error')),
    );

    component.loadRooms();

    expect(component.errorMessage()).toBe(
      'Não foi possível carregar as salas. Tente novamente.',
    );
  });

  it('debounces search input and requests page zero with the typed term', fakeAsync(() => {
    roomServiceSpy.list.calls.reset();

    component.onSearch({ target: { value: 'adultos' } } as unknown as Event);
    tick(299);
    expect(roomServiceSpy.list).not.toHaveBeenCalled();

    tick(1);
    expect(roomServiceSpy.list).toHaveBeenCalledWith(
      jasmine.objectContaining({ search: 'adultos', page: 0 }),
    );
  }));

  it('resets to page zero and reloads when the status filter changes', () => {
    component.onPageChange(2);
    roomServiceSpy.list.calls.reset();

    component.onStatusChange({
      target: { value: 'Active' },
    } as unknown as Event);

    expect(roomServiceSpy.list).toHaveBeenCalledWith(
      jasmine.objectContaining({ active: true, page: 0 }),
    );
  });

  it('requests the given page when the pagination component emits a page change', () => {
    roomServiceSpy.list.calls.reset();

    component.onPageChange(1);

    expect(component.page()).toBe(1);
    expect(roomServiceSpy.list).toHaveBeenCalledWith(
      jasmine.objectContaining({ page: 1 }),
    );
  });

  it('formats the capacity label from maxCapacity', () => {
    expect(component.capacityLabel(mockRooms()[0])).toBe('8 gatinhos');
    expect(component.capacityLabel(mockRooms()[1])).toBe('—');
  });

  it('does not open the confirmation dialog for an already inactive room', () => {
    component.requestDeactivation(mockRooms()[1]);

    expect(component.roomPendingDeactivation()).toBeNull();
  });

  it('opens the confirmation dialog for an active room without calling the API yet', () => {
    component.requestDeactivation(mockRooms()[0]);

    expect(component.roomPendingDeactivation()).toEqual(mockRooms()[0]);
    expect(roomServiceSpy.deactivate).not.toHaveBeenCalled();
  });

  it('closes the dialog without calling the API when cancelled', () => {
    component.requestDeactivation(mockRooms()[0]);

    component.cancelDeactivation();

    expect(component.roomPendingDeactivation()).toBeNull();
    expect(roomServiceSpy.deactivate).not.toHaveBeenCalled();
  });

  it('deactivates the room, reloads the list and closes the dialog on confirmation', () => {
    const listSubject = latestListSubject();
    listSubject.next(pagedResult(mockRooms()));
    listSubject.complete();

    roomServiceSpy.deactivate.and.returnValue(new Subject<void>());
    roomServiceSpy.list.calls.reset();
    roomServiceSpy.list.and.returnValue(new Subject<PagedResult<Room>>());
    const target = component.rooms()[0];

    component.requestDeactivation(target);
    component.confirmDeactivation();
    (
      roomServiceSpy.deactivate.calls.mostRecent().returnValue as Subject<void>
    ).next();

    expect(roomServiceSpy.deactivate).toHaveBeenCalledWith(target.id);
    expect(roomServiceSpy.list).toHaveBeenCalled();
    expect(component.roomPendingDeactivation()).toBeNull();
  });

  it('shows an error message and closes the dialog when deactivation fails', () => {
    const listSubject = latestListSubject();
    listSubject.next(pagedResult(mockRooms()));
    listSubject.complete();

    roomServiceSpy.deactivate.and.returnValue(
      throwError(() => new Error('server error')),
    );

    component.requestDeactivation(component.rooms()[0]);
    component.confirmDeactivation();

    expect(component.errorMessage()).toBe(
      'Não foi possível desativar a sala. Tente novamente.',
    );
    expect(component.roomPendingDeactivation()).toBeNull();
  });

  it('does not open the reactivation dialog for an active room', () => {
    component.requestReactivation(mockRooms()[0]);

    expect(component.roomPendingReactivation()).toBeNull();
  });

  it('opens the reactivation dialog for an inactive room without calling the API yet', () => {
    component.requestReactivation(mockRooms()[1]);

    expect(component.roomPendingReactivation()).toEqual(mockRooms()[1]);
    expect(roomServiceSpy.activate).not.toHaveBeenCalled();
  });

  it('closes the reactivation dialog without calling the API when cancelled', () => {
    component.requestReactivation(mockRooms()[1]);

    component.cancelReactivation();

    expect(component.roomPendingReactivation()).toBeNull();
    expect(roomServiceSpy.activate).not.toHaveBeenCalled();
  });

  it('reactivates the room, reloads the list and closes the dialog on confirmation', () => {
    roomServiceSpy.activate.and.returnValue(new Subject<void>());
    roomServiceSpy.list.calls.reset();
    roomServiceSpy.list.and.returnValue(new Subject<PagedResult<Room>>());
    const target = mockRooms()[1];

    component.requestReactivation(target);
    component.confirmReactivation();
    (
      roomServiceSpy.activate.calls.mostRecent().returnValue as Subject<void>
    ).next();

    expect(roomServiceSpy.activate).toHaveBeenCalledWith(target.id);
    expect(roomServiceSpy.list).toHaveBeenCalled();
    expect(component.roomPendingReactivation()).toBeNull();
  });

  it('shows an error message and closes the dialog when reactivation fails', () => {
    roomServiceSpy.activate.and.returnValue(
      throwError(() => new Error('server error')),
    );

    component.requestReactivation(mockRooms()[1]);
    component.confirmReactivation();

    expect(component.errorMessage()).toBe(
      'Não foi possível reativar a sala. Tente novamente.',
    );
    expect(component.roomPendingReactivation()).toBeNull();
    expect(component.activatingId()).toBeNull();
  });

  it('asks for deactivation when the status toggle is used on an active room', () => {
    component.onToggleStatus(mockRooms()[0]);

    expect(component.roomPendingDeactivation()).toEqual(mockRooms()[0]);
    expect(component.roomPendingReactivation()).toBeNull();
  });

  it('asks for reactivation when the status toggle is used on an inactive room', () => {
    component.onToggleStatus(mockRooms()[1]);

    expect(component.roomPendingReactivation()).toEqual(mockRooms()[1]);
    expect(component.roomPendingDeactivation()).toBeNull();
  });

  it('navigates to the new-room form', () => {
    const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(
      true,
    );

    component.createRoom();

    expect(navigate).toHaveBeenCalledWith(['/rooms/new']);
  });

  it('navigates to the edit form of the given room', () => {
    const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(
      true,
    );

    component.editRoom(mockRooms()[0]);

    expect(navigate).toHaveBeenCalledWith(['/rooms', 1, 'edit']);
  });
});
