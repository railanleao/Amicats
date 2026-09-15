import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Subject, throwError } from 'rxjs';

import { LoginResponse } from '../../models/auth.model';
import { AuthService } from '../../services/resources/auth.service';
import { LoginComponent } from './login.component';

describe('LoginComponent (unit)', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let component: LoginComponent;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', [
      'login',
    ]);
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigateByUrl']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function setFormValue(email: string, password: string): void {
    component.form.setValue({ email, password });
  }

  function mockUser(email: string): LoginResponse {
    return {
      token: 'fake-jwt-token',
      user: { id: '1', name: 'Marina Alves', email },
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

    subject.next(mockUser('marina.alves@amicats.org.br'));
    subject.complete();

    expect(component.loading()).toBeFalse();
  });

  it('navigates to the root route on successful login', () => {
    setFormValue('marina.alves@amicats.org.br', 'senha-forte');
    const subject = new Subject<LoginResponse>();
    authServiceSpy.login.and.returnValue(subject);

    component.onSubmit();
    subject.next(mockUser('marina.alves@amicats.org.br'));
    subject.complete();

    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/');
  });

  it('shows a generic error message and does not navigate on failure', () => {
    setFormValue('marina.alves@amicats.org.br', 'senha-forte');
    authServiceSpy.login.and.returnValue(
      throwError(() => new Error('network error')),
    );

    component.onSubmit();

    expect(component.errorMessage()).toBe(
      'Não foi possível entrar. Verifique suas credenciais.',
    );
    expect(routerSpy.navigateByUrl).not.toHaveBeenCalled();
    expect(component.loading()).toBeFalse();
  });
});
