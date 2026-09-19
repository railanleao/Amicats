import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Subject, throwError } from 'rxjs';

import { User } from '../../models/user.model';
import { UserService } from '../../services/resources/user.service';
import { UsersComponent } from './users.component';

describe('UsersComponent (unit)', () => {
  let fixture: ComponentFixture<UsersComponent>;
  let component: UsersComponent;
  let userServiceSpy: jasmine.SpyObj<UserService>;

  function mockUsers(): User[] {
    return [
      {
        id: 1,
        fullName: 'Marina Alves',
        email: 'marina.alves@amicats.org.br',
        phoneNumber: '(31) 99999-0000',
        imageUrl: null,
        accessType: 'Assistant',
        crmv: null,
        ufCrmv: null,
        active: true,
        createdAt: '2026-01-01T00:00:00',
      },
      {
        id: 2,
        fullName: 'Carla Souza',
        email: 'carla.souza@amicats.org.br',
        phoneNumber: null,
        imageUrl: null,
        accessType: 'Veterinarian',
        crmv: null,
        ufCrmv: null,
        active: false,
        createdAt: '2026-01-01T00:00:00',
      },
    ];
  }

  beforeEach(async () => {
    userServiceSpy = jasmine.createSpyObj<UserService>('UserService', ['list', 'deactivate']);
    userServiceSpy.list.and.returnValue(new Subject<User[]>());

    await TestBed.configureTestingModule({
      imports: [UsersComponent],
      providers: [provideRouter([]), { provide: UserService, useValue: userServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(UsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads the user list on init', () => {
    expect(userServiceSpy.list).toHaveBeenCalled();
  });

  it('populates the list once the request resolves', () => {
    const subject = userServiceSpy.list.calls.mostRecent().returnValue as Subject<User[]>;

    subject.next(mockUsers());
    subject.complete();

    expect(component.users()).toEqual(mockUsers());
    expect(component.loading()).toBeFalse();
  });

  it('shows an error message when the list request fails', () => {
    userServiceSpy.list.and.returnValue(throwError(() => new Error('network error')));

    component.loadUsers();

    expect(component.errorMessage()).toBe('Não foi possível carregar os usuários. Tente novamente.');
  });

  it('filters the users by search term across name and email', () => {
    const subject = userServiceSpy.list.calls.mostRecent().returnValue as Subject<User[]>;
    subject.next(mockUsers());
    subject.complete();

    component.searchTerm = 'carla';

    expect(component.filteredUsers).toEqual([mockUsers()[1]]);
  });

  it('does not open the confirmation dialog for an already inactive user', () => {
    component.requestDeactivation(mockUsers()[1]);

    expect(component.userPendingDeactivation()).toBeNull();
  });

  it('opens the confirmation dialog for an active user without calling the API yet', () => {
    component.requestDeactivation(mockUsers()[0]);

    expect(component.userPendingDeactivation()).toEqual(mockUsers()[0]);
    expect(userServiceSpy.deactivate).not.toHaveBeenCalled();
  });

  it('closes the dialog without calling the API when cancelled', () => {
    component.requestDeactivation(mockUsers()[0]);

    component.cancelDeactivation();

    expect(component.userPendingDeactivation()).toBeNull();
    expect(userServiceSpy.deactivate).not.toHaveBeenCalled();
  });

  it('deactivates the user, updates the local state and closes the dialog on confirmation', () => {
    const subject = userServiceSpy.list.calls.mostRecent().returnValue as Subject<User[]>;
    subject.next(mockUsers());
    subject.complete();

    userServiceSpy.deactivate.and.returnValue(new Subject<void>());
    const target = component.users()[0];

    component.requestDeactivation(target);
    component.confirmDeactivation();
    (userServiceSpy.deactivate.calls.mostRecent().returnValue as Subject<void>).next();

    expect(userServiceSpy.deactivate).toHaveBeenCalledWith(target.id);
    expect(component.users().find((u) => u.id === target.id)?.active).toBeFalse();
    expect(component.userPendingDeactivation()).toBeNull();
  });

  it('shows an error message and closes the dialog when deactivation fails', () => {
    const listSubject = userServiceSpy.list.calls.mostRecent().returnValue as Subject<User[]>;
    listSubject.next(mockUsers());
    listSubject.complete();

    userServiceSpy.deactivate.and.returnValue(throwError(() => new Error('server error')));

    component.requestDeactivation(component.users()[0]);
    component.confirmDeactivation();

    expect(component.errorMessage()).toBe('Não foi possível desativar o usuário. Tente novamente.');
    expect(component.userPendingDeactivation()).toBeNull();
  });
});
