import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Subject, throwError } from 'rxjs';

import { AuthService } from '../../services/resources/auth.service';
import { ForgotPasswordComponent } from './forgot-password.component';

describe('ForgotPasswordComponent (unit)', () => {
  let fixture: ComponentFixture<ForgotPasswordComponent>;
  let component: ForgotPasswordComponent;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', ['forgotPassword']);

    await TestBed.configureTestingModule({
      imports: [ForgotPasswordComponent],
      providers: [provideRouter([]), { provide: AuthService, useValue: authServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(ForgotPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function setFormValue(email: string): void {
    component.form.setValue({ email });
  }

  it('does not call the auth service and marks fields as touched when the form is invalid', () => {
    component.onSubmit();

    expect(authServiceSpy.forgotPassword).not.toHaveBeenCalled();
    expect(component.form.controls.email.touched).toBeTrue();
  });

  it('calls the auth service with the exact form payload when valid', () => {
    setFormValue('marina.alves@amicats.org.br');
    authServiceSpy.forgotPassword.and.returnValue(new Subject<void>());

    component.onSubmit();

    expect(authServiceSpy.forgotPassword).toHaveBeenCalledWith({
      email: 'marina.alves@amicats.org.br',
    });
  });

  it('sets loading while the request is in flight and clears it when it completes', () => {
    setFormValue('marina.alves@amicats.org.br');
    const subject = new Subject<void>();
    authServiceSpy.forgotPassword.and.returnValue(subject);

    component.onSubmit();
    expect(component.loading()).toBeTrue();

    subject.next();
    subject.complete();

    expect(component.loading()).toBeFalse();
  });

  it('shows the confirmation state on success, regardless of whether the email exists', () => {
    setFormValue('marina.alves@amicats.org.br');
    const subject = new Subject<void>();
    authServiceSpy.forgotPassword.and.returnValue(subject);

    component.onSubmit();
    subject.next();
    subject.complete();

    expect(component.submitted()).toBeTrue();
  });

  it('shows a rate-limit message on a 429 response and does not show the confirmation state', () => {
    setFormValue('marina.alves@amicats.org.br');
    authServiceSpy.forgotPassword.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 429, statusText: 'Too Many Requests' })),
    );

    component.onSubmit();

    expect(component.errorMessage()).toBe(
      'Muitas tentativas. Aguarde alguns instantes e tente novamente.',
    );
    expect(component.submitted()).toBeFalse();
    expect(component.loading()).toBeFalse();
  });

  it('shows a generic error message on an unexpected failure', () => {
    setFormValue('marina.alves@amicats.org.br');
    authServiceSpy.forgotPassword.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 500, statusText: 'Server Error' })),
    );

    component.onSubmit();

    expect(component.errorMessage()).toBe(
      'Não foi possível processar sua solicitação. Tente novamente em instantes.',
    );
    expect(component.submitted()).toBeFalse();
  });
});
