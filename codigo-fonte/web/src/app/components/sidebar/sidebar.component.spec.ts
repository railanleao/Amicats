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

  function stockMenuItem(): HTMLElement | null {
    const menuItems = Array.from(
      fixture.nativeElement.querySelectorAll('.menu-item'),
    ) as HTMLElement[];

    return (
      menuItems.find((item) => item.textContent?.includes('Estoque')) ?? null
    );
  }

  it('shows the translated label for the logged-in user access type', () => {
    expect(component.profileLabel()).toBe('Veterinário');
  });

  it('shows an empty label when there is no logged-in user', () => {
    currentUser.set(null);
    fixture.detectChanges();

    expect(component.profileLabel()).toBe('');
  });

  function syncLink(): HTMLElement | null {
    return fixture.nativeElement.querySelector('a[href="/sync"]');
  }

  it('hides the synchronization link from non-administrators', () => {
    expect(component.isAdministrator()).toBeFalse();
    expect(syncLink()).toBeNull();
  });

  it('shows the synchronization link to administrators', () => {
    currentUser.set({
      id: 1,
      name: 'Marina Alves',
      accessType: 'Administrator',
    });
    fixture.detectChanges();

    expect(component.isAdministrator()).toBeTrue();
    expect(syncLink()).not.toBeNull();
  });

  it('shows the stock menu item for an administrator', () => {
    currentUser.set({
      id: 1,
      name: 'Ana',
      accessType: 'Administrator',
    });

    fixture.detectChanges();

    expect(stockMenuItem()).not.toBeNull();
  });

  it('shows the stock menu item for an assistant', () => {
    currentUser.set({
      id: 2,
      name: 'Rui',
      accessType: 'Assistant',
    });

    fixture.detectChanges();

    expect(stockMenuItem()).not.toBeNull();
  });

  it('shows the stock menu item for a veterinarian', () => {
    currentUser.set({
      id: 3,
      name: 'Marina',
      accessType: 'Veterinarian',
    });

    fixture.detectChanges();

    expect(stockMenuItem()).not.toBeNull();
  });

  it('hides the stock menu item from a viewer', () => {
    currentUser.set({
      id: 4,
      name: 'Paula',
      accessType: 'Viewer',
    });

    fixture.detectChanges();

    expect(stockMenuItem()).toBeNull();
  });

  it('clears the session and navigates to /login on disconnect', () => {
    component.disconnect();

    expect(authServiceSpy.clearSession).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
