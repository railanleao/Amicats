import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { signal } from '@angular/core';

import { User } from '../../models/auth.model';
import { AuthService } from '../../services/resources/auth.service';
import { SidebarComponent } from './sidebar.component';

describe('SidebarComponent (unit)', () => {
  let fixture: ComponentFixture<SidebarComponent>;
  let component: SidebarComponent;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let router: Router;
  let currentUser: ReturnType<typeof signal<User | null>>;

  beforeEach(async () => {
    currentUser = signal<User | null>({
      id: 1,
      name: 'Marina Alves',
      accessType: 'Veterinarian',
    });

    authServiceSpy = jasmine.createSpyObj<AuthService>(
      'AuthService',
      ['clearSession'],
      {
        currentUser,
      },
    );

    await TestBed.configureTestingModule({
      imports: [SidebarComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceSpy },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('shows the translated label for the logged-in user access type', () => {
    expect(component.profileLabel()).toBe('Veterinário');
  });

  it('shows an empty label when there is no logged-in user', () => {
    currentUser.set(null);
    fixture.detectChanges();

    expect(component.profileLabel()).toBe('');
  });

  it('clears the session and navigates to /login on disconnect', () => {
    component.disconnect();

    expect(authServiceSpy.clearSession).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
