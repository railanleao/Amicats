import { HttpErrorResponse } from '@angular/common/http';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';

import { AccessType } from '../../models/auth.model';
import { User } from '../../models/user.model';
import { AuthService } from '../../services/resources/auth.service';
import { UserService } from '../../services/resources/user.service';
import { UserFormComponent } from './user-form.component';

describe('UserFormComponent', () => {
  let userServiceSpy: jasmine.SpyObj<UserService>;
  const currentUser = signal<{ id: number; name: string; accessType: AccessType } | null>(null);

  function existingUser(): User {
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
      createdAt: '2026-01-01T00:00:00',
      lastLoginAt: null,
    };
  }

  function createComponent(mode: 'create' | 'edit', id?: string) {
    TestBed.configureTestingModule({
      imports: [UserFormComponent],
      providers: [
        provideRouter([]),
        { provide: UserService, useValue: userServiceSpy },
        { provide: AuthService, useValue: { currentUser } },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { data: { mode }, paramMap: convertToParamMap(id ? { id } : {}) },
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

  beforeEach(() => {
    currentUser.set({ id: 1, name: 'Ana', accessType: 'Administrator' });
    userServiceSpy = jasmine.createSpyObj<UserService>('UserService', [
      'findById',
      'create',
      'update',
    ]);
    userServiceSpy.findById.and.returnValue(of(existingUser()));
  });

  describe('create mode', () => {
    it('starts empty and does not load any user', () => {
      const { fixture, component } = createComponent('create');

      expect(userServiceSpy.findById).not.toHaveBeenCalled();
      expect(component.form.controls.email.value).toBe('');
      expect(fixture.nativeElement.querySelector('h1').textContent).toContain('Novo usuário');
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

    it('creates the user with trimmed values and opens its edit page', () => {
      userServiceSpy.create.and.returnValue(of({ ...existingUser(), id: 9 }));
      const { component } = createComponent('create');
      const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
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
      expect(navigate).toHaveBeenCalledWith(['/users', 9, 'edit'], { state: { created: true } });
    });

    it('sends the CRMV and an upper-cased UF for veterinarians', () => {
      userServiceSpy.create.and.returnValue(of({ ...existingUser(), id: 9 }));
      const { component } = createComponent('create');
      spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
      fillValidCreateForm(component);
      component.form.controls.accessType.setValue('Veterinarian');
      component.form.controls.crmv.setValue(' 12345 ');
      component.form.controls.ufCrmv.setValue('ms');

      component.onSubmit();

      expect(userServiceSpy.create).toHaveBeenCalledWith(
        jasmine.objectContaining({ accessType: 'Veterinarian', crmv: '12345', ufCrmv: 'MS' }),
      );
    });

    it('drops the CRMV and UF when the profile is not veterinarian', () => {
      userServiceSpy.create.and.returnValue(of({ ...existingUser(), id: 9 }));
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

    it('shows a generic message on other failures', () => {
      userServiceSpy.create.and.returnValue(
        throwError(() => new HttpErrorResponse({ status: 500 })),
      );
      const { component } = createComponent('create');
      fillValidCreateForm(component);

      component.onSubmit();

      expect(component.saveError()).toBe('Não foi possível salvar o usuário. Tente novamente.');
      expect(component.saving()).toBeFalse();
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
  });

  describe('edit mode', () => {
    it('loads the user and fills the form', () => {
      const { fixture, component } = createComponent('edit', '7');

      expect(userServiceSpy.findById).toHaveBeenCalledWith(7);
      expect(component.form.controls.fullName.value).toBe('Marina Alves');
      expect(component.form.controls.accessType.value).toBe('Assistant');
      expect(fixture.nativeElement.querySelector('h1').textContent).toContain('Editar usuário');
    });

    it('keeps the e-mail read-only', () => {
      const { fixture } = createComponent('edit', '7');

      const input = fixture.nativeElement.querySelector('#email') as HTMLInputElement;
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
      const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);

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

      expect(component.saveError()).toBe('Você não pode alterar o seu próprio tipo de acesso.');
    });
  });
});
