import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Subject, throwError } from 'rxjs';

import { LoginResponse } from '../../models/auth.model';
import { AuthService } from '../../services/resources/auth.service';
import { TermsAcceptanceComponent } from './terms-acceptance.component';

describe('TermsAcceptanceComponent (unit)', () => {
  let fixture: ComponentFixture<TermsAcceptanceComponent>;
  let component: TermsAcceptanceComponent;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', [
      'acceptTerms',
      'mustChangePassword',
    ]);
    authServiceSpy.mustChangePassword.and.returnValue(false);
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigateByUrl']);

    await TestBed.configureTestingModule({
      imports: [TermsAcceptanceComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TermsAcceptanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

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

  it('does not call the auth service while the checkbox is unchecked', () => {
    component.onContinue();

    expect(authServiceSpy.acceptTerms).not.toHaveBeenCalled();
  });

  it('calls the auth service once the checkbox is checked', () => {
    component.toggleAccepted();
    authServiceSpy.acceptTerms.and.returnValue(new Subject<LoginResponse>());

    component.onContinue();

    expect(authServiceSpy.acceptTerms).toHaveBeenCalled();
  });

  it('navigates to / when the terms are accepted and no password change is pending', () => {
    component.toggleAccepted();
    const subject = new Subject<LoginResponse>();
    authServiceSpy.acceptTerms.and.returnValue(subject);

    component.onContinue();
    subject.next(mockResponse());
    subject.complete();

    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/');
  });

  it('navigates to /definir-nova-senha when a password change is still pending', () => {
    authServiceSpy.mustChangePassword.and.returnValue(true);
    component.toggleAccepted();
    const subject = new Subject<LoginResponse>();
    authServiceSpy.acceptTerms.and.returnValue(subject);

    component.onContinue();
    subject.next(mockResponse());
    subject.complete();

    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/definir-nova-senha');
  });

  it('shows an error message and does not navigate on failure', () => {
    component.toggleAccepted();
    authServiceSpy.acceptTerms.and.returnValue(
      throwError(() => new Error('network error')),
    );

    component.onContinue();

    expect(component.errorMessage()).toBe(
      'Não foi possível registrar o aceite. Tente novamente em instantes.',
    );
    expect(routerSpy.navigateByUrl).not.toHaveBeenCalled();
    expect(component.loading()).toBeFalse();
  });
});
