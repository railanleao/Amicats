import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';

import { Cat, CatSearchParams, PagedResult } from '../../models/cat.model';
import { Room } from '../../models/room.model';
import { CatService } from '../../services/resources/cat.service';
import { RoomService } from '../../services/resources/room.service';
import { CatsComponent } from './cats.component';

describe('CatsComponent (unit)', () => {
  let fixture: ComponentFixture<CatsComponent>;
  let component: CatsComponent;
  let catServiceSpy: jasmine.SpyObj<CatService>;
  let roomServiceSpy: jasmine.SpyObj<RoomService>;

  function mockCats(): Cat[] {
    return [
      {
        id: 1,
        name: 'Nina',
        photoUrl: null,
        roomId: 2,
        roomTitle: 'Observação Intensiva',
        sex: 'Female',
        estimatedBirthDate: '2022-09-01',
        ageGroup: 'Adult',
        coat: 'Rajada',
        weightKg: 4.1,
        characteristics: null,
        generalStatus: 'InClinic',
        healthStatus: 'Fiv',
        fivFelvExamDate: '2026-09-05',
        pifResult: 'Negative',
        pifExamDate: '2026-09-05',
        severity: null,
        neuteringStatus: 'Neutered',
        neuteringDate: '2025-01-15',
        microchip: null,
        rescueDate: null,
        foundConditions: null,
        sponsorName: null,
        sponsorPhone: null,
        sponsorFunding: null,
        createdAt: '2026-01-01T00:00:00',
      },
      {
        id: 2,
        name: 'Tom',
        photoUrl: null,
        roomId: null,
        roomTitle: null,
        sex: 'Male',
        estimatedBirthDate: null,
        ageGroup: null,
        coat: null,
        weightKg: null,
        characteristics: null,
        generalStatus: 'TemporaryHome',
        healthStatus: 'Healthy',
        fivFelvExamDate: null,
        pifResult: 'NotTested',
        pifExamDate: null,
        severity: null,
        neuteringStatus: null,
        neuteringDate: null,
        microchip: null,
        rescueDate: null,
        foundConditions: null,
        sponsorName: null,
        sponsorPhone: null,
        sponsorFunding: null,
        createdAt: '2026-01-01T00:00:00',
      },
    ];
  }

  function mockRooms(): Room[] {
    return [
      {
        id: 1,
        title: 'Quarentena',
        description: null,
        coverImageUrl: null,
        maxCapacity: 8,
        active: true,
      },
      {
        id: 2,
        title: 'Observação Intensiva',
        description: null,
        coverImageUrl: null,
        maxCapacity: 6,
        active: true,
      },
    ];
  }

  function pagedCats(
    content: Cat[],
    page = 0,
    totalPages = 1,
  ): PagedResult<Cat> {
    return {
      content,
      page,
      size: 20,
      totalElements: content.length,
      totalPages,
    };
  }

  function pagedRooms(content: Room[]): PagedResult<Room> {
    return {
      content,
      page: 0,
      size: 100,
      totalElements: content.length,
      totalPages: 1,
    };
  }

  beforeEach(async () => {
    catServiceSpy = jasmine.createSpyObj<CatService>('CatService', [
      'list',
      'photo',
    ]);
    roomServiceSpy = jasmine.createSpyObj<RoomService>('RoomService', [
      'list',
    ]);

    catServiceSpy.list.and.returnValue(new Subject<PagedResult<Cat>>());
    roomServiceSpy.list.and.returnValue(of(pagedRooms(mockRooms())));

    await TestBed.configureTestingModule({
      imports: [CatsComponent],
      providers: [
        provideRouter([]),
        { provide: CatService, useValue: catServiceSpy },
        { provide: RoomService, useValue: roomServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function latestListSubject(): Subject<PagedResult<Cat>> {
    return catServiceSpy.list.calls.mostRecent().returnValue as Subject<
      PagedResult<Cat>
    >;
  }

  it('loads the room list on init to populate the filter', () => {
    expect(roomServiceSpy.list).toHaveBeenCalledWith({ page: 0, size: 100 });
    expect(component.rooms()).toEqual(mockRooms());
  });

  it('loads the cat list on init with the default page and size', () => {
    expect(catServiceSpy.list).toHaveBeenCalledWith({
      search: undefined,
      roomId: undefined,
      generalStatus: undefined,
      page: 0,
      size: component.pageSize,
    } as CatSearchParams);
  });

  it('populates the list, total elements and total pages once the request resolves', () => {
    const subject = latestListSubject();

    subject.next(pagedCats(mockCats(), 0, 3));
    subject.complete();

    expect(component.cats()).toEqual(mockCats());
    expect(component.totalElements()).toBe(mockCats().length);
    expect(component.totalPages()).toBe(3);
    expect(component.loading()).toBeFalse();
  });

  it('shows an error message when the list request fails', () => {
    catServiceSpy.list.and.returnValue(
      throwError(() => new Error('network error')),
    );

    component.loadCats();

    expect(component.errorMessage()).toBe(
      'Não foi possível carregar os gatos. Tente novamente.',
    );
  });

  it('debounces search input and requests page zero with the typed term', fakeAsync(() => {
    catServiceSpy.list.calls.reset();

    component.onSearch({ target: { value: 'nina' } } as unknown as Event);
    tick(299);
    expect(catServiceSpy.list).not.toHaveBeenCalled();

    tick(1);
    expect(catServiceSpy.list).toHaveBeenCalledWith(
      jasmine.objectContaining({ search: 'nina', page: 0 }),
    );
  }));

  it('resets to page zero and reloads when the room filter changes', () => {
    component.onPageChange(2);
    catServiceSpy.list.calls.reset();

    component.onRoomChange({ target: { value: '2' } } as unknown as Event);

    expect(catServiceSpy.list).toHaveBeenCalledWith(
      jasmine.objectContaining({ roomId: 2, page: 0 }),
    );
  });

  it('resets to page zero and reloads when the status filter changes', () => {
    component.onPageChange(2);
    catServiceSpy.list.calls.reset();

    component.onStatusChange({
      target: { value: 'InClinic' },
    } as unknown as Event);

    expect(catServiceSpy.list).toHaveBeenCalledWith(
      jasmine.objectContaining({ generalStatus: 'InClinic', page: 0 }),
    );
  });

  it('requests the given page when the pagination component emits a page change', () => {
    catServiceSpy.list.calls.reset();

    component.onPageChange(1);

    expect(component.page()).toBe(1);
    expect(catServiceSpy.list).toHaveBeenCalledWith(
      jasmine.objectContaining({ page: 1 }),
    );
  });

  it('falls back to "Lar temporário" for a room-less cat in temporary home', () => {
    expect(component.roomLabel(mockCats()[1])).toBe('Lar temporário');
  });

  it('falls back to a dash for a room-less cat that is not in temporary home', () => {
    const cat = { ...mockCats()[1], generalStatus: 'InTriage' as const };
    expect(component.roomLabel(cat)).toBe('—');
  });

  it('combines age group and health status in the tag label when not healthy', () => {
    expect(component.tagLabel(mockCats()[0])).toBe('Adulto · FIV+');
  });

  it('omits the health suffix from the tag label when the cat is healthy', () => {
    const cat = { ...mockCats()[0], healthStatus: 'Healthy' as const };
    expect(component.tagLabel(cat)).toBe('Adulto');
  });

  it('navigates to the new cat form', () => {
    const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(
      true,
    );

    component.createCat();

    expect(navigate).toHaveBeenCalledWith(['/cats/new']);
  });

  it('navigates to the edit form of the given cat', () => {
    const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(
      true,
    );

    component.editCat(mockCats()[0]);

    expect(navigate).toHaveBeenCalledWith(['/cats', 1, 'edit']);
  });
});
