import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';

import { Cat } from '../../models/cat.model';
import { PagedResult } from '../../models/user.model';
import { Room } from '../../models/room.model';
import { CatService } from '../../services/resources/cat.service';
import { RoomService } from '../../services/resources/room.service';
import { CatFormComponent } from './cat-form.component';

describe('CatFormComponent', () => {
  let fixture: ComponentFixture<CatFormComponent>;
  let component: CatFormComponent;
  let catServiceSpy: jasmine.SpyObj<CatService>;
  let roomServiceSpy: jasmine.SpyObj<RoomService>;

  function createdCat(overrides: Partial<Cat> = {}): Cat {
    return {
      id: 9,
      name: 'Mingau',
      roomId: null,
      sex: null,
      estimatedBirthDate: null,
      coat: null,
      weightKg: null,
      characteristics: null,
      generalStatus: 'InTriage',
      microchip: null,
      rescueDate: null,
      foundConditions: null,
      sponsorName: null,
      sponsorPhone: null,
      sponsorFunding: null,
      photoUrl: null,
      roomTitle: null,
      createdAt: '2026-09-23T10:00:00',
      ...overrides,
    };
  }

  function aRoomPage(rooms: Room[]): PagedResult<Room> {
    return {
      content: rooms,
      page: 0,
      size: 100,
      totalElements: rooms.length,
      totalPages: 1,
    };
  }

  function aRoom(overrides: Partial<Room> = {}): Room {
    return {
      id: 1,
      title: 'Sala 1 - Filhotes',
      description: null,
      coverImageUrl: null,
      maxCapacity: null,
      active: true,
      ...overrides,
    };
  }

  function fileEvent(file: File): Event {
    return { target: { files: [file], value: 'x' } } as unknown as Event;
  }

  beforeEach(async () => {
    spyOn(URL, 'createObjectURL').and.returnValue('blob:photo');
    spyOn(URL, 'revokeObjectURL');

    catServiceSpy = jasmine.createSpyObj<CatService>('CatService', [
      'create',
      'uploadPhoto',
    ]);
    roomServiceSpy = jasmine.createSpyObj<RoomService>('RoomService', ['list']);
    roomServiceSpy.list.and.returnValue(of(aRoomPage([aRoom()])));

    await TestBed.configureTestingModule({
      imports: [CatFormComponent],
      providers: [
        provideRouter([]),
        { provide: CatService, useValue: catServiceSpy },
        { provide: RoomService, useValue: roomServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CatFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads the active rooms into the "Sala atual" select', () => {
    expect(roomServiceSpy.list).toHaveBeenCalledWith({
      active: true,
      page: 0,
      size: 100,
    });
    expect(component.rooms()).toEqual([aRoom()]);
  });

  it('shows a permission message when the caller cannot list rooms', () => {
    roomServiceSpy.list.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 403 })),
    );

    fixture = TestBed.createComponent(CatFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.roomsError()).toBe(
      'Você não tem permissão para ver as salas. Peça a um Administrador.',
    );
  });

  it('does not submit an invalid form and marks the fields as touched', () => {
    component.onSubmit();

    expect(catServiceSpy.create).not.toHaveBeenCalled();
    expect(component.form.controls.name.touched).toBeTrue();
  });

  it('creates the cat with trimmed values and null for blank optional fields', () => {
    catServiceSpy.create.and.returnValue(of(createdCat()));
    const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(
      true,
    );
    component.form.controls.name.setValue('  Mingau  ');

    component.onSubmit();

    expect(catServiceSpy.create).toHaveBeenCalledWith({
      name: 'Mingau',
      roomId: null,
      sex: null,
      estimatedBirthDate: null,
      coat: null,
      weightKg: null,
      characteristics: null,
      generalStatus: null,
      microchip: null,
      rescueDate: null,
      foundConditions: null,
      sponsorName: null,
      sponsorPhone: null,
      sponsorFunding: null,
    });
    expect(navigate).toHaveBeenCalledWith(['/']);
  });

  it('parses the weight using a comma as the decimal separator', () => {
    catServiceSpy.create.and.returnValue(of(createdCat()));
    spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    component.form.controls.name.setValue('Mingau');
    component.form.controls.weightKg.setValue('3,5');

    component.onSubmit();

    expect(catServiceSpy.create).toHaveBeenCalledWith(
      jasmine.objectContaining({ weightKg: 3.5 }),
    );
  });

  it('ignores a second submit while the first one is still saving', () => {
    catServiceSpy.create.and.returnValue(new Subject<Cat>());
    component.form.controls.name.setValue('Mingau');

    component.onSubmit();
    component.onSubmit();

    expect(catServiceSpy.create).toHaveBeenCalledTimes(1);
    expect(component.saving()).toBeTrue();
  });

  it('shows a generic message on failure', () => {
    catServiceSpy.create.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 500 })),
    );
    component.form.controls.name.setValue('Mingau');

    component.onSubmit();

    expect(component.saveError()).toBe(
      'Não foi possível salvar o gato. Tente novamente.',
    );
  });

  it('explains a 403 and a 404 answer from the API', () => {
    component.form.controls.name.setValue('Mingau');

    catServiceSpy.create.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 403 })),
    );
    component.onSubmit();
    expect(component.saveError()).toBe(
      'Você não tem permissão para cadastrar gatos.',
    );

    catServiceSpy.create.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 404 })),
    );
    component.onSubmit();
    expect(component.saveError()).toBe(
      'A sala selecionada não existe mais. Escolha outra.',
    );
  });

  it('shows a preview and keeps the chosen photo until submit', () => {
    const file = new File(['x'], 'foto.png', { type: 'image/png' });

    component.onPhotoSelected(fileEvent(file));

    expect(component.pendingPhoto()).toBe(file);
    expect(component.pendingPhotoUrl()).toBe('blob:photo');
    expect(component.hasPhoto).toBeTrue();
    expect(catServiceSpy.uploadPhoto).not.toHaveBeenCalled();
  });

  it('rejects an invalid photo choice without keeping it', () => {
    component.onPhotoSelected(
      fileEvent(new File(['x'], 'nota.txt', { type: 'text/plain' })),
    );

    expect(component.pendingPhoto()).toBeNull();
    expect(component.photoError()).toBe('Envie uma imagem JPG ou PNG.');
  });

  it('discards the chosen photo when it is removed', () => {
    component.onPhotoSelected(
      fileEvent(new File(['x'], 'foto.png', { type: 'image/png' })),
    );

    component.removePhoto();

    expect(component.pendingPhoto()).toBeNull();
    expect(component.pendingPhotoUrl()).toBeNull();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:photo');
  });

  it('uploads the chosen photo right after creating the cat', () => {
    catServiceSpy.create.and.returnValue(of(createdCat({ id: 9 })));
    catServiceSpy.uploadPhoto.and.returnValue(
      of(createdCat({ id: 9, photoUrl: '/cats/9/photo' })),
    );
    const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(
      true,
    );
    const file = new File(['x'], 'foto.png', { type: 'image/png' });
    component.form.controls.name.setValue('Mingau');
    component.onPhotoSelected(fileEvent(file));

    component.onSubmit();

    expect(catServiceSpy.uploadPhoto).toHaveBeenCalledWith(9, file);
    expect(navigate).toHaveBeenCalledWith(['/']);
  });

  it('keeps the user on the page and flags the photo when the upload fails', () => {
    catServiceSpy.create.and.returnValue(of(createdCat({ id: 9 })));
    catServiceSpy.uploadPhoto.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 500 })),
    );
    const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(
      true,
    );
    component.form.controls.name.setValue('Mingau');
    component.onPhotoSelected(
      fileEvent(new File(['x'], 'foto.png', { type: 'image/png' })),
    );

    component.onSubmit();

    expect(navigate).not.toHaveBeenCalled();
    expect(component.saveError()).toContain('a foto não pôde ser enviada');
  });
});
