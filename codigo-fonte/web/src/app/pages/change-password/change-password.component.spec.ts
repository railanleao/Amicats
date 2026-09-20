import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Subject, throwError } from 'rxjs';

import { LoginResponse } from '../../models/auth.model';
import { AuthService } from '../../services/resources/auth.service';
import { ChangePasswordComponent } from './change-password.component';

describe('ChangePasswordComponent (unit)', () => {
  let fixture: ComponentFixture<ChangePasswordComponent>;
  let component: ChangePasswordComponent;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', [
      'changePassword',
    ]);
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigateByUrl']);

    await TestBed.configureTestingModule({
      imports: [ChangePasswordComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ChangePasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function setFormValue(
    currentPassword: string,
    newPassword: string,
    confirmNewPassword: string,
  ): void {
    component.form.setValue({ currentPassword, newPassword, confirmNewPassword });
  }

  function mockResponse(): LoginResponse {
    return {
      token: 'fake-jwt-token',
      id: 1,
      name: 'Marina Alves',
      accessType: 'Assistant',
      termsAccepted: true,
      mustChangePassword: false,
    };
  }

  it('does not call the auth service and marks fields as touched when the form is invalid', () => {
    component.onSubmit();

    expect(authServiceSpy.changePassword).not.toHaveBeenCalled();
    expect(component.form.controls.currentPassword.touched).toBeTrue();
  });

  it('shows a mismatch error without calling the auth service when confirmation differs', () => {
    setFormValue('senha-temporaria', 'senha-nova-forte', 'outra-coisa');

    component.onSubmit();

    expect(authServiceSpy.changePassword).not.toHaveBeenCalled();
    expect(component.errorMessage()).toBe('A confirmação não confere com a nova senha.');
  });

  it('calls the auth service with the exact form payload when valid', () => {
    setFormValue('senha-temporaria', 'senha-nova-forte', 'senha-nova-forte');
    authServiceSpy.changePassword.and.returnValue(new Subject<LoginResponse>());

    component.onSubmit();

    expect(authServiceSpy.changePassword).toHaveBeenCalledWith({
      currentPassword: 'senha-temporaria',
      newPassword: 'senha-nova-forte',
      confirmNewPassword: 'senha-nova-forte',
    });
  });

  it('navigates to / on successful password change', () => {
    setFormValue('senha-temporaria', 'senha-nova-forte', 'senha-nova-forte');
    const subject = new Subject<LoginResponse>();
    authServiceSpy.changePassword.and.returnValue(subject);

    component.onSubmit();
    subject.next(mockResponse());
    subject.complete();

    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/');
  });

  it('shows an error message and does not navigate on a 400 response', () => {
    setFormValue('senha-errada', 'senha-nova-forte', 'senha-nova-forte');
    authServiceSpy.changePassword.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 400, statusText: 'Bad Request' })),
    );

    component.onSubmit();

    expect(component.errorMessage()).toBe(
      'Não foi possível trocar a senha. Confira a senha atual e tente novamente.',
    );
    expect(routerSpy.navigateByUrl).not.toHaveBeenCalled();
    expect(component.loading()).toBeFalse();
  });
});
