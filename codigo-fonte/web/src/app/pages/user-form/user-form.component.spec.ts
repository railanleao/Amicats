import { HttpErrorResponse } from '@angular/common/http';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  ActivatedRoute,
  Router,
  convertToParamMap,
  provideRouter,
} from '@angular/router';
import { Subject, of, throwError } from 'rxjs';

import { AccessType } from '../../models/auth.model';
import { User } from '../../models/user.model';
import { AuthService } from '../../services/resources/auth.service';
import { UserService } from '../../services/resources/user.service';
import { UserFormComponent } from './user-form.component';

describe('UserFormComponent', () => {
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let forgotPassword: jasmine.Spy;
  const currentUser = signal<{
    id: number;
    name: string;
    accessType: AccessType;
  } | null>(null);

  function existingUser(overrides: Partial<User> = {}): User {
    return {
      id: 7,
      fullName: 'Marina Alves',
      email: 'marina.alves@amicats.org.br',
      phoneNumber: '(31) 99999-0000',
      imageUrl: null,
      accessType: 'Assistant',
      crmv: null,
      ufCrmv: null,
      active: true,
      createdAt: '2026-01-01T12:00:00',
      lastLoginAt: null,
      ...overrides,
    };
  }

  function createComponent(mode: 'create' | 'edit', id?: string) {
    TestBed.configureTestingModule({
      imports: [UserFormComponent],
      providers: [
        provideRouter([]),
        { provide: UserService, useValue: userServiceSpy },
        { provide: AuthService, useValue: { currentUser, forgotPassword } },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: { mode },
              paramMap: convertToParamMap(id ? { id } : {}),
            },
          },
        },
      ],
    });

    const fixture = TestBed.createComponent(UserFormComponent);
    fixture.detectChanges();
    return { fixture, component: fixture.componentInstance };
  }

  function fillValidCreateForm(component: UserFormComponent): void {
    component.form.controls.fullName.setValue('  Rafael Nogueira ');
    component.form.controls.email.setValue('rafael@amicats.org.br');
    component.form.controls.accessType.setValue('Assistant');
  }

  function fileEvent(file: File): Event {
    return { target: { files: [file], value: 'x' } } as unknown as Event;
  }

  beforeEach(() => {
    currentUser.set({ id: 1, name: 'Ana', accessType: 'Administrator' });
    spyOn(URL, 'createObjectURL').and.returnValue('blob:photo');
    spyOn(URL, 'revokeObjectURL');
    forgotPassword = jasmine
      .createSpy('forgotPassword')
      .and.returnValue(of(undefined));
    userServiceSpy = jasmine.createSpyObj<UserService>('UserService', [
      'findById',
      'create',
      'update',
      'activate',
      'deactivate',
      'uploadPhoto',
      'removePhoto',
      'photo',
    ]);
    userServiceSpy.findById.and.returnValue(of(existingUser()));
    userServiceSpy.photo.and.returnValue(of(new Blob(['x'])));
  });

  describe('create mode', () => {
    it('starts empty, does not load any user and hides the edit-only sections', () => {
      const { fixture, component } = createComponent('create');

      expect(userServiceSpy.findById).not.toHaveBeenCalled();
      expect(component.form.controls.email.value).toBe('');
      expect(fixture.nativeElement.querySelector('h1').textContent).toContain(
        'Novo usuário',
      );
      expect(fixture.nativeElement.querySelector('app-toggle')).toBeNull();
      expect(fixture.nativeElement.querySelector('.meta-card')).toBeNull();
    });

    it('offers an accessible back button to the users list', () => {
      const { fixture } = createComponent('create');

      const back = fixture.nativeElement.querySelector(
        'a.page-header__back',
      ) as HTMLAnchorElement;
      expect(back.getAttribute('aria-label')).toBe('Voltar para usuários');
      expect(back.getAttribute('href')).toBe('/users');
      expect(back.querySelector('svg')).not.toBeNull();
    });

    it('shows placeholders to guide the empty fields', () => {
      const { fixture } = createComponent('create');

      const email = fixture.nativeElement.querySelector(
        '#email',
      ) as HTMLInputElement;
      const name = fixture.nativeElement.querySelector(
        '#fullName',
      ) as HTMLInputElement;
      expect(email.placeholder).not.toBe('');
      expect(name.placeholder).not.toBe('');
    });

    it('does not submit an invalid form and marks the fields as touched', () => {
      const { component } = createComponent('create');

      component.onSubmit();

      expect(userServiceSpy.create).not.toHaveBeenCalled();
      expect(component.form.controls.fullName.touched).toBeTrue();
    });

    it('requires CRMV and UF only for veterinarians', () => {
      const { component } = createComponent('create');
      const { accessType, crmv, ufCrmv } = component.form.controls;

      accessType.setValue('Assistant');
      expect(component.showCrmv).toBeFalse();
      expect(crmv.valid).toBeTrue();

      accessType.setValue('Veterinarian');
      expect(component.showCrmv).toBeTrue();
      expect(crmv.hasError('required')).toBeTrue();
      expect(ufCrmv.hasError('required')).toBeTrue();

      crmv.setValue('12345');
      ufCrmv.setValue('MS');
      expect(crmv.valid && ufCrmv.valid).toBeTrue();
    });

    it('creates the user with trimmed values, no password, and opens its edit page', () => {
      userServiceSpy.create.and.returnValue(of(existingUser({ id: 9 })));
      const { component } = createComponent('create');
      const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(
        true,
      );
      fillValidCreateForm(component);

      component.onSubmit();

      expect(userServiceSpy.create).toHaveBeenCalledWith({
        fullName: 'Rafael Nogueira',
        email: 'rafael@amicats.org.br',
        phoneNumber: null,
        accessType: 'Assistant',
        crmv: null,
        ufCrmv: null,
      });
      expect(userServiceSpy.uploadPhoto).not.toHaveBeenCalled();
      expect(navigate).toHaveBeenCalledWith(['/users', 9, 'edit'], {
        state: { created: true, photoFailed: false },
      });
    });

    it('sends the CRMV and an upper-cased UF for veterinarians', () => {
      userServiceSpy.create.and.returnValue(of(existingUser({ id: 9 })));
      const { component } = createComponent('create');
      spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
      fillValidCreateForm(component);
      component.form.controls.accessType.setValue('Veterinarian');
      component.form.controls.crmv.setValue(' 12345 ');
      component.form.controls.ufCrmv.setValue('ms');

      component.onSubmit();

      expect(userServiceSpy.create).toHaveBeenCalledWith(
        jasmine.objectContaining({
          accessType: 'Veterinarian',
          crmv: '12345',
          ufCrmv: 'MS',
        }),
      );
    });

    it('drops the CRMV and UF when the profile is not veterinarian', () => {
      userServiceSpy.create.and.returnValue(of(existingUser({ id: 9 })));
      const { component } = createComponent('create');
      spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
      fillValidCreateForm(component);
      component.form.controls.accessType.setValue('Veterinarian');
      component.form.controls.crmv.setValue('12345');
      component.form.controls.ufCrmv.setValue('MS');
      component.form.controls.accessType.setValue('Assistant');

      component.onSubmit();

      expect(userServiceSpy.create).toHaveBeenCalledWith(
        jasmine.objectContaining({ crmv: null, ufCrmv: null }),
      );
    });

    it('shows the duplicated e-mail message when the API answers 409', () => {
      userServiceSpy.create.and.returnValue(
        throwError(() => new HttpErrorResponse({ status: 409 })),
      );
      const { component } = createComponent('create');
      fillValidCreateForm(component);

      component.onSubmit();

      expect(component.saveError()).toBe('Este e-mail já está cadastrado.');
      expect(component.saving()).toBeFalse();
    });

    it('explains that nothing was created when the access e-mail could not be sent', () => {
      userServiceSpy.create.and.returnValue(
        throwError(() => new HttpErrorResponse({ status: 502 })),
      );
      const { component } = createComponent('create');
      fillValidCreateForm(component);

      component.onSubmit();

      expect(component.saveError()).toContain('não foi cadastrado');
    });

    it('shows a generic message on other failures', () => {
      userServiceSpy.create.and.returnValue(
        throwError(() => new HttpErrorResponse({ status: 500 })),
      );
      const { component } = createComponent('create');
      fillValidCreateForm(component);

      component.onSubmit();

      expect(component.saveError()).toBe(
        'Não foi possível salvar o usuário. Tente novamente.',
      );
    });

    it('ignores a second submit while the first one is still saving', () => {
      userServiceSpy.create.and.returnValue(new Subject<User>());
      const { component } = createComponent('create');
      fillValidCreateForm(component);

      component.onSubmit();
      component.onSubmit();

      expect(userServiceSpy.create).toHaveBeenCalledTimes(1);
      expect(component.saving()).toBeTrue();
    });

    it('shows a preview and keeps the chosen photo until the user is created', () => {
      const { component } = createComponent('create');
      const file = new File(['x'], 'foto.png', { type: 'image/png' });

      component.onPhotoSelected(fileEvent(file));

      expect(component.pendingPhoto()).toBe(file);
      expect(component.pendingPhotoUrl()).toBe('blob:photo');
      expect(component.hasPhoto).toBeTrue();
      expect(userServiceSpy.uploadPhoto).not.toHaveBeenCalled();
    });

    it('rejects an invalid photo choice without keeping it', () => {
      const { component } = createComponent('create');

      component.onPhotoSelected(
        fileEvent(new File(['x'], 'nota.txt', { type: 'text/plain' })),
      );

      expect(component.pendingPhoto()).toBeNull();
      expect(component.photoError()).toBe('Envie uma imagem JPG ou PNG.');
    });

    it('discards the chosen photo when it is removed', () => {
      const { component } = createComponent('create');
      component.onPhotoSelected(
        fileEvent(new File(['x'], 'foto.png', { type: 'image/png' })),
      );

      component.removePhoto();

      expect(component.pendingPhoto()).toBeNull();
      expect(component.pendingPhotoUrl()).toBeNull();
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:photo');
    });

    it('uploads the chosen photo right after creating the user', () => {
      userServiceSpy.create.and.returnValue(of(existingUser({ id: 9 })));
      userServiceSpy.uploadPhoto.and.returnValue(
        of(existingUser({ id: 9, imageUrl: '/users/9/photo' })),
      );
      const { component } = createComponent('create');
      const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(
        true,
      );
      const file = new File(['x'], 'foto.png', { type: 'image/png' });
      fillValidCreateForm(component);
      component.onPhotoSelected(fileEvent(file));

      component.onSubmit();

      expect(userServiceSpy.uploadPhoto).toHaveBeenCalledWith(9, file);
      expect(navigate).toHaveBeenCalledWith(['/users', 9, 'edit'], {
        state: { created: true, photoFailed: false },
      });
    });

    it('still opens the edit page and flags the photo when the upload fails', () => {
      userServiceSpy.create.and.returnValue(of(existingUser({ id: 9 })));
      userServiceSpy.uploadPhoto.and.returnValue(
        throwError(() => new HttpErrorResponse({ status: 500 })),
      );
      const { component } = createComponent('create');
      const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(
        true,
      );
      fillValidCreateForm(component);
      component.onPhotoSelected(
        fileEvent(new File(['x'], 'foto.png', { type: 'image/png' })),
      );

      component.onSubmit();

      expect(navigate).toHaveBeenCalledWith(['/users', 9, 'edit'], {
        state: { created: true, photoFailed: true },
      });
    });
  });

  describe('edit mode', () => {
    it('loads the user and fills the form', () => {
      const { fixture, component } = createComponent('edit', '7');

      expect(userServiceSpy.findById).toHaveBeenCalledWith(7);
      expect(component.form.controls.fullName.value).toBe('Marina Alves');
      expect(component.form.controls.accessType.value).toBe('Assistant');
      expect(fixture.nativeElement.querySelector('h1').textContent).toContain(
        'Editar usuário',
      );
    });

    it('keeps the e-mail read-only', () => {
      const { fixture } = createComponent('edit', '7');

      const input = fixture.nativeElement.querySelector(
        '#email',
      ) as HTMLInputElement;
      expect(input.readOnly).toBeTrue();
    });

    it('shows a not-found message when the user does not exist', () => {
      userServiceSpy.findById.and.returnValue(
        throwError(() => new HttpErrorResponse({ status: 404 })),
      );

      const { component } = createComponent('edit', '99');

      expect(component.loadError()).toBe('Usuário não encontrado.');
    });

    it('updates without sending the e-mail and returns to the list', () => {
      userServiceSpy.update.and.returnValue(of(existingUser()));
      const { component } = createComponent('edit', '7');
      const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(
        true,
      );

      component.form.controls.fullName.setValue('Marina A. Alves');
      component.form.controls.phoneNumber.setValue('');
      component.onSubmit();

      expect(userServiceSpy.update).toHaveBeenCalledWith(7, {
        fullName: 'Marina A. Alves',
        phoneNumber: null,
        accessType: 'Assistant',
        crmv: null,
        ufCrmv: null,
      });
      expect(navigate).toHaveBeenCalledWith(['/users']);
    });

    it('blocks changing the own access type but still sends the current one', () => {
      currentUser.set({ id: 7, name: 'Marina', accessType: 'Administrator' });
      userServiceSpy.update.and.returnValue(of(existingUser()));
      const { component } = createComponent('edit', '7');
      spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);

      expect(component.form.controls.accessType.disabled).toBeTrue();

      component.onSubmit();

      expect(userServiceSpy.update).toHaveBeenCalledWith(
        7,
        jasmine.objectContaining({ accessType: 'Assistant' }),
      );
    });

    it('explains a 409 as an attempt to change the own access type', () => {
      userServiceSpy.update.and.returnValue(
        throwError(() => new HttpErrorResponse({ status: 409 })),
      );
      const { component } = createComponent('edit', '7');

      component.onSubmit();

      expect(component.saveError()).toBe(
        'Você não pode alterar o seu próprio tipo de acesso.',
      );
    });

    it('shows the registration date and that the user never logged in', () => {
      const { fixture } = createComponent('edit', '7');

      const text: string =
        fixture.nativeElement.querySelector('.meta-card').textContent;
      expect(text).toContain('01/01/2026');
      expect(text).toContain('Nunca acessou');
    });

    it('shows the last login date and time when there is one', () => {
      userServiceSpy.findById.and.returnValue(
        of(existingUser({ lastLoginAt: '2026-09-19T08:14:00' })),
      );

      const { fixture } = createComponent('edit', '7');

      const text: string =
        fixture.nativeElement.querySelector('.meta-card').textContent;
      const local = new Date('2026-09-19T08:14:00Z');
      const pad = (value: number) => String(value).padStart(2, '0');
      expect(text).toContain(
        `${pad(local.getDate())}/${pad(local.getMonth() + 1)}/${local.getFullYear()} ` +
          `${pad(local.getHours())}:${pad(local.getMinutes())}`,
      );
    });

    it('shows the created notice when arriving from a registration', () => {
      spyOnProperty(history, 'state', 'get').and.returnValue({ created: true });

      const { fixture, component } = createComponent('edit', '7');

      expect(component.justCreated).toBeTrue();
      expect(fixture.nativeElement.textContent).toContain('Usuário cadastrado');
    });

    it('warns when the photo could not be sent during the registration', () => {
      spyOnProperty(history, 'state', 'get').and.returnValue({
        created: true,
        photoFailed: true,
      });

      const { fixture, component } = createComponent('edit', '7');

      expect(component.photoFailed).toBeTrue();
      expect(fixture.nativeElement.textContent).toContain(
        'a foto não pôde ser enviada',
      );
    });

    describe('account status', () => {
      it('asks for confirmation and then deactivates another user', () => {
        userServiceSpy.deactivate.and.returnValue(of(undefined));
        const { component } = createComponent('edit', '7');

        component.onToggleStatus();
        expect(component.statusDialog()).toBe('deactivate');
        expect(userServiceSpy.deactivate).not.toHaveBeenCalled();

        component.confirmStatusChange();

        expect(userServiceSpy.deactivate).toHaveBeenCalledWith(7);
        expect(component.user()?.active).toBeFalse();
        expect(component.statusDialog()).toBeNull();
      });

      it('reactivates an inactive user after confirmation', () => {
        userServiceSpy.findById.and.returnValue(
          of(existingUser({ active: false })),
        );
        userServiceSpy.activate.and.returnValue(of(undefined));
        const { component } = createComponent('edit', '7');

        component.onToggleStatus();
        expect(component.statusDialog()).toBe('activate');

        component.confirmStatusChange();

        expect(userServiceSpy.activate).toHaveBeenCalledWith(7);
        expect(component.user()?.active).toBeTrue();
      });

      it('closes the dialog without calling the API when cancelled', () => {
        const { component } = createComponent('edit', '7');

        component.onToggleStatus();
        component.cancelStatusChange();

        expect(component.statusDialog()).toBeNull();
        expect(userServiceSpy.deactivate).not.toHaveBeenCalled();
        expect(userServiceSpy.activate).not.toHaveBeenCalled();
      });

      it('does not let the administrator deactivate themselves', () => {
        currentUser.set({ id: 7, name: 'Marina', accessType: 'Administrator' });
        const { component } = createComponent('edit', '7');

        component.onToggleStatus();

        expect(component.statusDialog()).toBeNull();
      });

      it('shows a message and keeps the status when the change fails', () => {
        userServiceSpy.deactivate.and.returnValue(
          throwError(() => new HttpErrorResponse({ status: 500 })),
        );
        const { component } = createComponent('edit', '7');

        component.onToggleStatus();
        component.confirmStatusChange();

        expect(component.statusError()).toBe(
          'Não foi possível alterar o status. Tente novamente.',
        );
        expect(component.user()?.active).toBeTrue();
        expect(component.statusDialog()).toBeNull();
      });
    });

    describe('password reset', () => {
      it('requests the reset for the e-mail of the edited user with a neutral message', () => {
        const { component } = createComponent('edit', '7');

        component.resetPassword();

        expect(forgotPassword).toHaveBeenCalledWith({
          email: 'marina.alves@amicats.org.br',
        });
        expect(component.resetMessage()).toContain(
          'Se o e-mail estiver cadastrado',
        );
      });

      it('explains a rate limit answer', () => {
        forgotPassword.and.returnValue(
          throwError(() => new HttpErrorResponse({ status: 429 })),
        );
        const { component } = createComponent('edit', '7');

        component.resetPassword();

        expect(component.resetError()).toBe(
          'Muitas tentativas. Aguarde um minuto e tente novamente.',
        );
      });

      it('shows a generic message on other failures', () => {
        forgotPassword.and.returnValue(
          throwError(() => new HttpErrorResponse({ status: 500 })),
        );
        const { component } = createComponent('edit', '7');

        component.resetPassword();

        expect(component.resetError()).toBe(
          'Não foi possível enviar o e-mail. Tente novamente.',
        );
      });
    });

    describe('photo', () => {
      it('uploads a valid image and refreshes the avatar', () => {
        userServiceSpy.uploadPhoto.and.returnValue(
          of(existingUser({ imageUrl: '/users/7/photo' })),
        );
        const { component } = createComponent('edit', '7');
        const file = new File(['x'], 'foto.png', { type: 'image/png' });

        component.onPhotoSelected(fileEvent(file));

        expect(userServiceSpy.uploadPhoto).toHaveBeenCalledWith(7, file);
        expect(component.hasPhoto).toBeTrue();
        expect(component.photoVersion()).toBe(1);
        expect(component.photoBusy()).toBeFalse();
      });

      it('rejects files that are not JPG or PNG without calling the API', () => {
        const { component } = createComponent('edit', '7');

        component.onPhotoSelected(
          fileEvent(new File(['x'], 'nota.txt', { type: 'text/plain' })),
        );

        expect(userServiceSpy.uploadPhoto).not.toHaveBeenCalled();
        expect(component.photoError()).toBe('Envie uma imagem JPG ou PNG.');
      });

      it('rejects images over 5 MB without calling the API', () => {
        const { component } = createComponent('edit', '7');
        const big = new File(
          [new Uint8Array(5 * 1024 * 1024 + 1)],
          'grande.png',
          {
            type: 'image/png',
          },
        );

        component.onPhotoSelected(fileEvent(big));

        expect(userServiceSpy.uploadPhoto).not.toHaveBeenCalled();
        expect(component.photoError()).toBe('A foto deve ter no máximo 5 MB.');
      });

      it('explains a 400 answer from the API', () => {
        userServiceSpy.uploadPhoto.and.returnValue(
          throwError(() => new HttpErrorResponse({ status: 400 })),
        );
        const { component } = createComponent('edit', '7');

        component.onPhotoSelected(
          fileEvent(new File(['x'], 'foto.png', { type: 'image/png' })),
        );

        expect(component.photoError()).toContain('Envie um JPG ou PNG válido');
      });

      it('removes the photo and refreshes the avatar', () => {
        userServiceSpy.findById.and.returnValue(
          of(existingUser({ imageUrl: '/users/7/photo' })),
        );
        userServiceSpy.removePhoto.and.returnValue(of(undefined));
        const { component } = createComponent('edit', '7');

        component.removePhoto();

        expect(userServiceSpy.removePhoto).toHaveBeenCalledWith(7);
        expect(component.hasPhoto).toBeFalse();
        expect(component.photoVersion()).toBe(1);
      });
    });
  });
});
