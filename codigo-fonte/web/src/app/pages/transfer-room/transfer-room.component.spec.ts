import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  ActivatedRoute,
  Router,
  convertToParamMap,
  provideRouter,
} from '@angular/router';
import { of, throwError } from 'rxjs';

import { Cat, PagedResult } from '../../models/cat.model';
import { RoomTransfer } from '../../models/room-transfer.model';
import { Room } from '../../models/room.model';
import { CatService } from '../../services/resources/cat.service';
import { RoomTransferService } from '../../services/resources/room-transfer.service';
import { RoomService } from '../../services/resources/room.service';
import { TransferRoomComponent } from './transfer-room.component';

describe('TransferRoomComponent', () => {
  let fixture: ComponentFixture<TransferRoomComponent>;
  let component: TransferRoomComponent;
  let catServiceSpy: jasmine.SpyObj<CatService>;
  let roomServiceSpy: jasmine.SpyObj<RoomService>;
  let roomTransferServiceSpy: jasmine.SpyObj<RoomTransferService>;

  function mockCat(overrides: Partial<Cat> = {}): Cat {
    return {
      id: 1,
      name: 'Nina',
      photoUrl: null,
      roomId: 2,
      roomTitle: 'Observação Intensiva',
      sex: 'Female',
      estimatedBirthDate: '2022-09-01',
      ageGroup: 'Adult',
      coat: 'Tricolor, pelo curto',
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
      microchip: '982000123456789',
      rescueDate: '2025-08-01',
      foundConditions: 'Desnutrida, ferida na pata',
      sponsorName: 'Fernanda Costa',
      sponsorPhone: '(31) 99145-8820',
      sponsorFunding: 'Ração terapêutica e exames',
      createdAt: '2026-01-01T00:00:00',
      ...overrides,
    };
  }

  function aRoom(overrides: Partial<Room> = {}): Room {
    return {
      id: 2,
      title: 'Observação Intensiva',
      description: 'Enfermaria',
      coverImageUrl: null,
      maxCapacity: 8,
      active: true,
      ...overrides,
    };
  }

  function aTransfer(overrides: Partial<RoomTransfer> = {}): RoomTransfer {
    return {
      id: 1,
      catId: 1,
      fromRoomId: 4,
      fromRoomTitle: 'Quarentena',
      toRoomId: 2,
      toRoomTitle: 'Observação Intensiva',
      reason: 'Alta clínica.',
      createdAt: '2025-12-12T09:00:00',
      ...overrides,
    };
  }

  function pagedRooms(content: Room[]): PagedResult<Room> {
    return { content, page: 0, size: 100, totalElements: content.length, totalPages: 1 };
  }

  function pagedCats(totalElements: number): PagedResult<Cat> {
    return { content: [], page: 0, size: 1, totalElements, totalPages: totalElements > 0 ? 1 : 0 };
  }

  function createComponent(id = '1'): void {
    TestBed.configureTestingModule({
      imports: [TransferRoomComponent],
      providers: [
        provideRouter([]),
        { provide: CatService, useValue: catServiceSpy },
        { provide: RoomService, useValue: roomServiceSpy },
        { provide: RoomTransferService, useValue: roomTransferServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ id }) } },
        },
      ],
    });

    fixture = TestBed.createComponent(TransferRoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(() => {
    catServiceSpy = jasmine.createSpyObj<CatService>('CatService', [
      'findById',
      'list',
    ]);
    roomServiceSpy = jasmine.createSpyObj<RoomService>('RoomService', ['list']);
    roomTransferServiceSpy = jasmine.createSpyObj<RoomTransferService>(
      'RoomTransferService',
      ['create', 'list'],
    );

    roomServiceSpy.list.and.returnValue(of(pagedRooms([])));
    catServiceSpy.list.and.returnValue(of(pagedCats(0)));
    roomTransferServiceSpy.list.and.returnValue(of([]));
  });

  it('loads the cat by the id from the route on init', () => {
    catServiceSpy.findById.and.returnValue(of(mockCat()));

    createComponent('1');

    expect(catServiceSpy.findById).toHaveBeenCalledWith(1);
    expect(component.cat()).toEqual(mockCat());
    expect(component.loading()).toBeFalse();
  });

  it('shows an error message when the cat fails to load', () => {
    catServiceSpy.findById.and.returnValue(throwError(() => new Error('network error')));

    createComponent('1');

    expect(component.loadError()).toBe('Não foi possível carregar a ficha do gato.');
  });

  it('splits active rooms into the current room and the other selectable rooms, with real occupancy', () => {
    catServiceSpy.findById.and.returnValue(of(mockCat({ roomId: 2 })));
    roomServiceSpy.list.and.returnValue(
      of(
        pagedRooms([
          aRoom({ id: 2, title: 'Observação Intensiva', description: 'Enfermaria', maxCapacity: 8 }),
          aRoom({ id: 3, title: 'Convivência Livre', description: null, maxCapacity: 14 }),
          aRoom({ id: 4, title: 'Quarentena', description: null, maxCapacity: 6 }),
        ]),
      ),
    );
    catServiceSpy.list.and.callFake((params) => {
      if (params.roomId === 2) return of(pagedCats(7));
      if (params.roomId === 3) return of(pagedCats(9));
      if (params.roomId === 4) return of(pagedCats(2));
      return of(pagedCats(0));
    });

    createComponent('1');

    expect(component.currentRoomInfo()).toEqual({
      title: 'Observação Intensiva',
      description: 'Enfermaria',
      occupied: 7,
      capacity: 8,
    });
    expect(component.otherRooms()).toEqual([
      { id: 3, title: 'Convivência Livre', occupied: 9, capacity: 14 },
      { id: 4, title: 'Quarentena', occupied: 2, capacity: 6 },
    ]);
  });

  it('excludes rooms without a maxCapacity from the selectable list', () => {
    catServiceSpy.findById.and.returnValue(of(mockCat({ roomId: 2 })));
    roomServiceSpy.list.and.returnValue(
      of(pagedRooms([aRoom({ id: 2 }), aRoom({ id: 5, maxCapacity: null })])),
    );

    createComponent('1');

    expect(component.otherRooms()).toEqual([]);
  });

  it('shows the most recent transfer from the history, or a placeholder when there is none', () => {
    catServiceSpy.findById.and.returnValue(of(mockCat({ roomId: 2 })));
    roomTransferServiceSpy.list.and.returnValue(
      of([aTransfer(), aTransfer({ id: 2, createdAt: '2025-01-01T00:00:00' })]),
    );

    createComponent('1');

    expect(component.lastTransfer()).toEqual(aTransfer());
  });

  it('requires both a selected room and a non-blank reason before submitting', () => {
    catServiceSpy.findById.and.returnValue(of(mockCat({ roomId: 2 })));
    createComponent('1');

    expect(component.canSubmit).toBeFalse();

    component.selectRoom(3);
    expect(component.canSubmit).toBeFalse();

    component.reason = '   ';
    expect(component.canSubmit).toBeFalse();

    component.reason = 'Alta clínica.';
    expect(component.canSubmit).toBeTrue();
  });

  it('creates the room transfer with the trimmed reason and navigates back to the ficha', () => {
    const cat = mockCat({ roomId: 2 });
    catServiceSpy.findById.and.returnValue(of(cat));
    roomTransferServiceSpy.create.and.returnValue(of(cat));

    createComponent('1');
    const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);

    component.confirmTransfer();
    expect(roomTransferServiceSpy.create).not.toHaveBeenCalled();

    component.selectRoom(3);
    component.reason = '  Alta clínica.  ';
    component.confirmTransfer();

    expect(roomTransferServiceSpy.create).toHaveBeenCalledWith(1, {
      roomId: 3,
      reason: 'Alta clínica.',
    });
    expect(navigate).toHaveBeenCalledWith(['/cats', 1]);
  });

  it('shows an error and stops submitting when the transfer fails', () => {
    catServiceSpy.findById.and.returnValue(of(mockCat({ roomId: 2 })));
    roomTransferServiceSpy.create.and.returnValue(throwError(() => new Error('network error')));

    createComponent('1');
    component.selectRoom(3);
    component.reason = 'Alta clínica.';
    component.confirmTransfer();

    expect(component.submitError()).toBe('Não foi possível transferir o gato. Tente novamente.');
    expect(component.submitting()).toBeFalse();
  });
});
