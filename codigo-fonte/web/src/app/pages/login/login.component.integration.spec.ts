import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { environment } from '../../../environments/environment';
import { LoginResponse } from '../../models/auth.model';
import { apiUrlInterceptor } from '../../services/http/api-url.interceptor';
import { AuthService } from '../../services/resources/auth.service';
import { LoginComponent } from './login.component';

describe('LoginComponent (integration)', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let httpMock: HttpTestingController;
  let authService: AuthService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideHttpClient(withInterceptors([apiUrlInterceptor])),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    spyOn(router, 'navigateByUrl').and.resolveTo(true);

    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  function fillForm(email: string, password: string): void {
    fixture.componentInstance.form.setValue({ email, password });
  }

  function submit(): void {
    const form: HTMLFormElement = fixture.nativeElement.querySelector('form');
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
  }

  it('sends the real HTTP request through the real interceptor and stores the session on success', () => {
    fillForm('marina.alves@amicats.org.br', 'senha-forte');
    submit();

    const request = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      email: 'marina.alves@amicats.org.br',
      password: 'senha-forte',
    });

    const mockResponse: LoginResponse = {
      token: 'fake-jwt-token',
      user: {
        id: '1',
        name: 'Marina Alves',
        email: 'marina.alves@amicats.org.br',
      },
    };
    request.flush(mockResponse);

    expect(authService.getToken()).toBe(mockResponse.token);
    expect(router.navigateByUrl).toHaveBeenCalledWith('/');
  });

  it('shows a friendly error message without crashing when the backend is unreachable', () => {
    fillForm('marina.alves@amicats.org.br', 'senha-forte');
    submit();

    const request = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    request.error(new ProgressEvent('network error'));
    fixture.detectChanges();

    const errorBanner: HTMLElement =
      fixture.nativeElement.querySelector('.login-card__error');
    expect(errorBanner.textContent).toContain('Não foi possível entrar');
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });
});
