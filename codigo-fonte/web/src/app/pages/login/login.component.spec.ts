import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { Subject, throwError } from 'rxjs';

import { LoginResponse } from '../../models/auth.model';
import { AuthService } from '../../services/resources/auth.service';
import { LoginComponent } from './login.component';

describe('LoginComponent (unit)', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let component: LoginComponent;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', [
      'login',
    ]);

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceSpy },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigateByUrl').and.resolveTo(true);

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function setFormValue(email: string, password: string): void {
    component.form.setValue({ email, password });
  }

  function mockUser(): LoginResponse {
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

    expect(authServiceSpy.login).not.toHaveBeenCalled();
    expect(component.form.controls.email.touched).toBeTrue();
    expect(component.form.controls.password.touched).toBeTrue();
  });

  it('calls the auth service with the exact form payload when valid', () => {
    setFormValue('marina.alves@amicats.org.br', 'senha-forte');
    authServiceSpy.login.and.returnValue(new Subject<LoginResponse>());

    component.onSubmit();

    expect(authServiceSpy.login).toHaveBeenCalledWith({
      email: 'marina.alves@amicats.org.br',
      password: 'senha-forte',
    });
  });

  it('sets loading while the request is in flight and clears it when it completes', () => {
    setFormValue('marina.alves@amicats.org.br', 'senha-forte');
    const subject = new Subject<LoginResponse>();
    authServiceSpy.login.and.returnValue(subject);

    component.onSubmit();
    expect(component.loading()).toBeTrue();

    subject.next(mockUser());
    subject.complete();

    expect(component.loading()).toBeFalse();
  });

  it('navigates to the root route on successful login', () => {
    setFormValue('marina.alves@amicats.org.br', 'senha-forte');
    const subject = new Subject<LoginResponse>();
    authServiceSpy.login.and.returnValue(subject);

    component.onSubmit();
    subject.next(mockUser());
    subject.complete();

    expect(router.navigateByUrl).toHaveBeenCalledWith('/');
  });

  it('shows an invalid-credentials message on a 401 response and does not navigate', () => {
    setFormValue('marina.alves@amicats.org.br', 'senha-forte');
    authServiceSpy.login.and.returnValue(
      throwError(
        () => new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' }),
      ),
    );

    component.onSubmit();

    expect(component.errorMessage()).toBe('E-mail ou senha inválidos.');
    expect(router.navigateByUrl).not.toHaveBeenCalled();
    expect(component.loading()).toBeFalse();
  });

  it('shows a generic error message and does not navigate on an unexpected failure', () => {
    setFormValue('marina.alves@amicats.org.br', 'senha-forte');
    authServiceSpy.login.and.returnValue(
      throwError(
        () => new HttpErrorResponse({ status: 500, statusText: 'Server Error' }),
      ),
    );

    component.onSubmit();

    expect(component.errorMessage()).toBe(
      'Não foi possível entrar. Tente novamente em instantes.',
    );
    expect(router.navigateByUrl).not.toHaveBeenCalled();
    expect(component.loading()).toBeFalse();
  });
});
