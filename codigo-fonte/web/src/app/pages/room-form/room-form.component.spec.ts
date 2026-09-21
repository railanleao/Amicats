import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';

import { Room } from '../../models/room.model';
import { RoomService } from '../../services/resources/room.service';
import { RoomFormComponent } from './room-form.component';

describe('RoomFormComponent', () => {
  let roomServiceSpy: jasmine.SpyObj<RoomService>;

  function existingRoom(overrides: Partial<Room> = {}): Room {
    return {
      id: 7,
      title: 'Sala 1 — Adultos',
      description: 'Sala principal',
      coverImageUrl: null,
      maxCapacity: 8,
      active: true,
      ...overrides,
    };
  }

  function createComponent(mode: 'create' | 'edit', id?: string) {
    TestBed.configureTestingModule({
      imports: [RoomFormComponent],
      providers: [
        provideRouter([]),
        { provide: RoomService, useValue: roomServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { data: { mode }, paramMap: convertToParamMap(id ? { id } : {}) },
          },
        },
      ],
    });

    const fixture = TestBed.createComponent(RoomFormComponent);
    fixture.detectChanges();
    return { fixture, component: fixture.componentInstance };
  }

  function fillValidCreateForm(component: RoomFormComponent): void {
    component.form.controls.title.setValue('  Sala 8 — Filhotes ');
    component.form.controls.maxCapacity.setValue(6);
  }

  beforeEach(() => {
    roomServiceSpy = jasmine.createSpyObj<RoomService>('RoomService', [
      'findById',
      'create',
      'update',
      'activate',
      'deactivate',
    ]);
    roomServiceSpy.findById.and.returnValue(of(existingRoom()));
  });

  describe('create mode', () => {
    it('starts empty, does not load any room and hides the edit-only section', () => {
      const { fixture, component } = createComponent('create');

      expect(roomServiceSpy.findById).not.toHaveBeenCalled();
      expect(component.form.controls.title.value).toBe('');
      expect(fixture.nativeElement.querySelector('h1').textContent).toContain('Nova sala');
      expect(fixture.nativeElement.querySelector('.setting-row')).toBeNull();
    });

    it('offers an accessible back button to the rooms list', () => {
      const { fixture } = createComponent('create');

      const back = fixture.nativeElement.querySelector('a.page-header__back') as HTMLAnchorElement;
      expect(back.getAttribute('aria-label')).toBe('Voltar para salas');
      expect(back.getAttribute('href')).toBe('/rooms');
    });

    it('does not submit an invalid form and marks the fields as touched', () => {
      const { component } = createComponent('create');

      component.onSubmit();

      expect(roomServiceSpy.create).not.toHaveBeenCalled();
      expect(component.form.controls.title.touched).toBeTrue();
    });

    it('creates the room with trimmed values and returns to the list', () => {
      roomServiceSpy.create.and.returnValue(of(existingRoom({ id: 9 })));
      const { component } = createComponent('create');
      const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
      fillValidCreateForm(component);

      component.onSubmit();

      expect(roomServiceSpy.create).toHaveBeenCalledWith({
        title: 'Sala 8 — Filhotes',
        description: null,
        coverImageUrl: null,
        maxCapacity: 6,
      });
      expect(navigate).toHaveBeenCalledWith(['/rooms']);
    });

    it('sends null when the optional fields are left blank', () => {
      roomServiceSpy.create.and.returnValue(of(existingRoom({ id: 9 })));
      const { component } = createComponent('create');
      spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
      component.form.controls.title.setValue('Sala 8');

      component.onSubmit();

      expect(roomServiceSpy.create).toHaveBeenCalledWith({
        title: 'Sala 8',
        description: null,
        coverImageUrl: null,
        maxCapacity: null,
      });
    });

    it('shows a generic message on failure', () => {
      roomServiceSpy.create.and.returnValue(
        throwError(() => new HttpErrorResponse({ status: 500 })),
      );
      const { component } = createComponent('create');
      fillValidCreateForm(component);

      component.onSubmit();

      expect(component.saveError()).toBe('Não foi possível salvar a sala. Tente novamente.');
    });

    it('ignores a second submit while the first one is still saving', () => {
      roomServiceSpy.create.and.returnValue(new Subject<Room>());
      const { component } = createComponent('create');
      fillValidCreateForm(component);

      component.onSubmit();
      component.onSubmit();

      expect(roomServiceSpy.create).toHaveBeenCalledTimes(1);
      expect(component.saving()).toBeTrue();
    });
  });

  describe('edit mode', () => {
    it('loads the room and fills the form', () => {
      const { fixture, component } = createComponent('edit', '7');

      expect(roomServiceSpy.findById).toHaveBeenCalledWith(7);
      expect(component.form.controls.title.value).toBe('Sala 1 — Adultos');
      expect(component.form.controls.maxCapacity.value).toBe(8);
      expect(fixture.nativeElement.querySelector('h1').textContent).toContain('Editar sala');
    });

    it('shows a not-found message when the room does not exist', () => {
      roomServiceSpy.findById.and.returnValue(
        throwError(() => new HttpErrorResponse({ status: 404 })),
      );

      const { component } = createComponent('edit', '99');

      expect(component.loadError()).toBe('Sala não encontrada.');
    });

    it('updates and returns to the list', () => {
      roomServiceSpy.update.and.returnValue(of(existingRoom()));
      const { component } = createComponent('edit', '7');
      const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);

      component.form.controls.title.setValue('Sala 1 — Adultos Renomeada');

      component.onSubmit();

      expect(roomServiceSpy.update).toHaveBeenCalledWith(7, {
        title: 'Sala 1 — Adultos Renomeada',
        description: 'Sala principal',
        coverImageUrl: null,
        maxCapacity: 8,
      });
      expect(navigate).toHaveBeenCalledWith(['/rooms']);
    });

    describe('status', () => {
      it('asks for confirmation and then deactivates the room', () => {
        roomServiceSpy.deactivate.and.returnValue(of(undefined));
        const { component } = createComponent('edit', '7');

        component.onToggleStatus();
        expect(component.statusDialog()).toBe('deactivate');
        expect(roomServiceSpy.deactivate).not.toHaveBeenCalled();

        component.confirmStatusChange();

        expect(roomServiceSpy.deactivate).toHaveBeenCalledWith(7);
        expect(component.room()?.active).toBeFalse();
        expect(component.statusDialog()).toBeNull();
      });

      it('reactivates an inactive room after confirmation', () => {
        roomServiceSpy.findById.and.returnValue(of(existingRoom({ active: false })));
        roomServiceSpy.activate.and.returnValue(of(undefined));
        const { component } = createComponent('edit', '7');

        component.onToggleStatus();
        expect(component.statusDialog()).toBe('activate');

        component.confirmStatusChange();

        expect(roomServiceSpy.activate).toHaveBeenCalledWith(7);
        expect(component.room()?.active).toBeTrue();
      });

      it('closes the dialog without calling the API when cancelled', () => {
        const { component } = createComponent('edit', '7');

        component.onToggleStatus();
        component.cancelStatusChange();

        expect(component.statusDialog()).toBeNull();
        expect(roomServiceSpy.deactivate).not.toHaveBeenCalled();
        expect(roomServiceSpy.activate).not.toHaveBeenCalled();
      });

      it('shows a message and keeps the status when the change fails', () => {
        roomServiceSpy.deactivate.and.returnValue(
          throwError(() => new HttpErrorResponse({ status: 500 })),
        );
        const { component } = createComponent('edit', '7');

        component.onToggleStatus();
        component.confirmStatusChange();

        expect(component.statusError()).toBe(
          'Não foi possível alterar o status. Tente novamente.',
        );
        expect(component.room()?.active).toBeTrue();
        expect(component.statusDialog()).toBeNull();
      });
    });
  });
});
