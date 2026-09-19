import {ComponentFixture, TestBed, fakeAsync, tick} from '@angular/core/testing';
import {provideRouter} from '@angular/router';
import {Subject, throwError} from 'rxjs';

import {PagedResult, User, UserSearchParams} from '../../models/user.model';
import {UserService} from '../../services/resources/user.service';
import {UsersComponent} from './users.component';

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

  function pagedResult(content: User[], page = 0, totalPages = 1): PagedResult<User> {
    return {content, page, size: 20, totalElements: content.length, totalPages};
  }

  beforeEach(async () => {
    userServiceSpy = jasmine.createSpyObj<UserService>('UserService', [
      'list',
      'deactivate',
      'activate',
    ]);
    userServiceSpy.list.and.returnValue(new Subject<PagedResult<User>>());

    await TestBed.configureTestingModule({
      imports: [UsersComponent],
      providers: [provideRouter([]), {provide: UserService, useValue: userServiceSpy}],
    }).compileComponents();

    fixture = TestBed.createComponent(UsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function latestListSubject(): Subject<PagedResult<User>> {
    return userServiceSpy.list.calls.mostRecent().returnValue as Subject<PagedResult<User>>;
  }

  it('loads the user list on init with the default page and size', () => {
    expect(userServiceSpy.list).toHaveBeenCalledWith({
      search: undefined,
      accessType: undefined,
      active: undefined,
      page: 0,
      size: component.pageSize,
    } as UserSearchParams);
  });

  it('populates the list, total elements and total pages once the request resolves', () => {
    const subject = latestListSubject();

    subject.next(pagedResult(mockUsers(), 0, 3));
    subject.complete();

    expect(component.users()).toEqual(mockUsers());
    expect(component.totalElements()).toBe(mockUsers().length);
    expect(component.totalPages()).toBe(3);
    expect(component.loading()).toBeFalse();
  });

  it('shows an error message when the list request fails', () => {
    userServiceSpy.list.and.returnValue(throwError(() => new Error('network error')));

    component.loadUsers();

    expect(component.errorMessage()).toBe('Não foi possível carregar os usuários. Tente novamente.');
  });

  it('debounces search input and requests page zero with the typed term', fakeAsync(() => {
    userServiceSpy.list.calls.reset();

    component.onSearch({target: {value: 'carla'}} as unknown as Event);
    tick(299);
    expect(userServiceSpy.list).not.toHaveBeenCalled();

    tick(1);
    expect(userServiceSpy.list).toHaveBeenCalledWith(
      jasmine.objectContaining({search: 'carla', page: 0}),
    );
  }));

  it('resets to page zero and reloads when the profile filter changes', () => {
    component.onPageChange(2);
    userServiceSpy.list.calls.reset();

    component.onProfileChange({target: {value: 'Veterinarian'}} as unknown as Event);

    expect(userServiceSpy.list).toHaveBeenCalledWith(
      jasmine.objectContaining({accessType: 'Veterinarian', page: 0}),
    );
  });

  it('resets to page zero and reloads when the status filter changes', () => {
    component.onPageChange(2);
    userServiceSpy.list.calls.reset();

    component.onStatusChange({target: {value: 'Active'}} as unknown as Event);

    expect(userServiceSpy.list).toHaveBeenCalledWith(
      jasmine.objectContaining({active: true, page: 0}),
    );
  });

  it('requests the given page when the pagination component emits a page change', () => {
    userServiceSpy.list.calls.reset();

    component.onPageChange(1);

    expect(component.page()).toBe(1);
    expect(userServiceSpy.list).toHaveBeenCalledWith(jasmine.objectContaining({page: 1}));
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

  it('deactivates the user, reloads the list and closes the dialog on confirmation', () => {
    const listSubject = latestListSubject();
    listSubject.next(pagedResult(mockUsers()));
    listSubject.complete();

    userServiceSpy.deactivate.and.returnValue(new Subject<void>());
    userServiceSpy.list.calls.reset();
    userServiceSpy.list.and.returnValue(new Subject<PagedResult<User>>());
    const target = component.users()[0];

    component.requestDeactivation(target);
    component.confirmDeactivation();
    (userServiceSpy.deactivate.calls.mostRecent().returnValue as Subject<void>).next();

    expect(userServiceSpy.deactivate).toHaveBeenCalledWith(target.id);
    expect(userServiceSpy.list).toHaveBeenCalled();
    expect(component.userPendingDeactivation()).toBeNull();
  });

  it('shows an error message and closes the dialog when deactivation fails', () => {
    const listSubject = latestListSubject();
    listSubject.next(pagedResult(mockUsers()));
    listSubject.complete();

    userServiceSpy.deactivate.and.returnValue(throwError(() => new Error('server error')));

    component.requestDeactivation(component.users()[0]);
    component.confirmDeactivation();

    expect(component.errorMessage()).toBe('Não foi possível desativar o usuário. Tente novamente.');
    expect(component.userPendingDeactivation()).toBeNull();
  });

  it('does not open the reactivation dialog for an active user', () => {
    component.requestReactivation(mockUsers()[0]);

    expect(component.userPendingReactivation()).toBeNull();
  });

  it('opens the reactivation dialog for an inactive user without calling the API yet', () => {
    component.requestReactivation(mockUsers()[1]);

    expect(component.userPendingReactivation()).toEqual(mockUsers()[1]);
    expect(userServiceSpy.activate).not.toHaveBeenCalled();
  });

  it('closes the reactivation dialog without calling the API when cancelled', () => {
    component.requestReactivation(mockUsers()[1]);

    component.cancelReactivation();

    expect(component.userPendingReactivation()).toBeNull();
    expect(userServiceSpy.activate).not.toHaveBeenCalled();
  });

  it('reactivates the user, reloads the list and closes the dialog on confirmation', () => {
    userServiceSpy.activate.and.returnValue(new Subject<void>());
    userServiceSpy.list.calls.reset();
    userServiceSpy.list.and.returnValue(new Subject<PagedResult<User>>());
    const target = mockUsers()[1];

    component.requestReactivation(target);
    component.confirmReactivation();
    (userServiceSpy.activate.calls.mostRecent().returnValue as Subject<void>).next();

    expect(userServiceSpy.activate).toHaveBeenCalledWith(target.id);
    expect(userServiceSpy.list).toHaveBeenCalled();
    expect(component.userPendingReactivation()).toBeNull();
  });

  it('shows an error message and closes the dialog when reactivation fails', () => {
    userServiceSpy.activate.and.returnValue(throwError(() => new Error('server error')));

    component.requestReactivation(mockUsers()[1]);
    component.confirmReactivation();

    expect(component.errorMessage()).toBe('Não foi possível reativar o usuário. Tente novamente.');
    expect(component.userPendingReactivation()).toBeNull();
    expect(component.activatingId()).toBeNull();
  });

  it('asks for deactivation when the status toggle is used on an active user', () => {
    component.onToggleStatus(mockUsers()[0]);

    expect(component.userPendingDeactivation()).toEqual(mockUsers()[0]);
    expect(component.userPendingReactivation()).toBeNull();
  });

  it('asks for reactivation when the status toggle is used on an inactive user', () => {
    component.onToggleStatus(mockUsers()[1]);

    expect(component.userPendingReactivation()).toEqual(mockUsers()[1]);
    expect(component.userPendingDeactivation()).toBeNull();
  });
});
