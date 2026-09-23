import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';

import { Cat, CatPhoto, RoomOption } from '../../models/cat.model';
import { CatService } from '../../services/resources/cat.service';
import { CatFormComponent } from './cat-form.component';

describe('CatFormComponent', () => {
  let fixture: ComponentFixture<CatFormComponent>;
  let component: CatFormComponent;
  let catServiceSpy: jasmine.SpyObj<CatService>;

  function createdCat(overrides: Partial<Cat> = {}): Cat {
    return {
      id: 9,
      name: 'Mingau',
      roomId: null,
      sex: null,
      estimatedAge: null,
      coat: null,
      microchip: null,
      fiv: null,
      felv: null,
      pif: null,
      neutered: null,
      clinicalStatus: 'InTriage',
      healthNotes: null,
      rescueDate: null,
      rescueLocation: null,
      sponsorName: null,
      sponsorPhone: null,
      sponsorCoverage: null,
      createdAt: '2026-09-23T10:00:00',
      photoUrls: [],
      ...overrides,
    };
  }

  function aRoom(overrides: Partial<RoomOption> = {}): RoomOption {
    return { id: 1, title: 'Sala 1 - Filhotes', ...overrides };
  }

  function photoFile(name = 'foto.png', type = 'image/png', size = 10): File {
    return new File([new Uint8Array(size)], name, { type });
  }

  function fileEvent(files: File[]): Event {
    return { target: { files, value: 'x' } } as unknown as Event;
  }

  beforeEach(async () => {
    spyOn(URL, 'createObjectURL').and.callFake(
      (file: unknown) => `blob:${(file as File).name}`,
    );
    spyOn(URL, 'revokeObjectURL');

    catServiceSpy = jasmine.createSpyObj<CatService>('CatService', [
      'create',
      'uploadPhoto',
      'listActiveRooms',
      'findById',
    ]);
    catServiceSpy.listActiveRooms.and.returnValue(of([aRoom()]));

    await TestBed.configureTestingModule({
      imports: [CatFormComponent],
      providers: [
        provideRouter([]),
        { provide: CatService, useValue: catServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CatFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads the active rooms into the "Sala atual" select', () => {
    expect(catServiceSpy.listActiveRooms).toHaveBeenCalled();
    expect(component.rooms()).toEqual([aRoom()]);
  });

  it('shows a permission message when the caller cannot list rooms', () => {
    catServiceSpy.listActiveRooms.and.returnValue(
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
      estimatedAge: null,
      coat: null,
      microchip: null,
      fiv: null,
      felv: null,
      pif: null,
      neutered: null,
      clinicalStatus: null,
      healthNotes: null,
      rescueDate: null,
      rescueLocation: null,
      sponsorName: null,
      sponsorPhone: null,
      sponsorCoverage: null,
    });
    expect(navigate).toHaveBeenCalledWith(['/']);
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

  it('uploads every chosen photo right after creating the cat and then navigates home', () => {
    catServiceSpy.create.and.returnValue(of(createdCat({ id: 9 })));
    catServiceSpy.uploadPhoto.and.returnValue(
      of({ id: 1, url: '/cats/9/photos/1' } as CatPhoto),
    );
    const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(
      true,
    );
    component.form.controls.name.setValue('Mingau');
    component.onPhotosSelected(
      fileEvent([photoFile('a.png'), photoFile('b.png')]),
    );

    component.onSubmit();

    expect(catServiceSpy.uploadPhoto).toHaveBeenCalledTimes(2);
    expect(catServiceSpy.uploadPhoto).toHaveBeenCalledWith(
      9,
      jasmine.any(File),
    );
    expect(navigate).toHaveBeenCalledWith(['/']);
  });

  it('keeps the user on the page and reports how many photos failed, without navigating', () => {
    catServiceSpy.create.and.returnValue(of(createdCat({ id: 9 })));
    catServiceSpy.uploadPhoto.and.returnValues(
      of({ id: 1, url: '/cats/9/photos/1' } as CatPhoto),
      throwError(() => new HttpErrorResponse({ status: 500 })),
    );
    const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(
      true,
    );
    component.form.controls.name.setValue('Mingau');
    component.onPhotosSelected(
      fileEvent([photoFile('a.png'), photoFile('b.png')]),
    );

    component.onSubmit();

    expect(navigate).not.toHaveBeenCalled();
    expect(component.saveError()).toContain('1 de 2 foto(s)');
    expect(component.pendingPhotos()).toEqual([]);
  });

  it('shows a preview for each selected photo and keeps them until submit', () => {
    component.onPhotosSelected(
      fileEvent([photoFile('a.png'), photoFile('b.png')]),
    );

    expect(component.pendingPhotos().length).toBe(2);
    expect(component.pendingPhotoUrls()).toEqual(['blob:a.png', 'blob:b.png']);
    expect(catServiceSpy.uploadPhoto).not.toHaveBeenCalled();
  });

  it('rejects a photo that is not JPG or PNG', () => {
    component.onPhotosSelected(
      fileEvent([photoFile('nota.txt', 'text/plain')]),
    );

    expect(component.pendingPhotos()).toEqual([]);
    expect(component.photoError()).toBe('Envie imagens JPG ou PNG.');
  });

  it('rejects a photo over 5 MB', () => {
    component.onPhotosSelected(
      fileEvent([photoFile('grande.png', 'image/png', 5 * 1024 * 1024 + 1)]),
    );

    expect(component.pendingPhotos()).toEqual([]);
    expect(component.photoError()).toBe('Cada foto deve ter no máximo 5 MB.');
  });

  it('caps the selection at 6 photos total', () => {
    const sixPhotos = Array.from({ length: 6 }, (_, i) =>
      photoFile(`${i}.png`),
    );
    component.onPhotosSelected(fileEvent(sixPhotos));

    component.onPhotosSelected(fileEvent([photoFile('extra.png')]));

    expect(component.pendingPhotos().length).toBe(6);
    expect(component.photoError()).toBe('No máximo 6 fotos por gato.');
  });

  it('discards a chosen photo when it is removed', () => {
    component.onPhotosSelected(
      fileEvent([photoFile('a.png'), photoFile('b.png')]),
    );

    component.removePendingPhoto(0);

    expect(component.pendingPhotos().length).toBe(1);
    expect(component.pendingPhotoUrls()).toEqual(['blob:b.png']);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:a.png');
  });
});
