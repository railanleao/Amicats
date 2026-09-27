import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AuthService } from '../../services/resources/auth.service';
import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let fixture: ComponentFixture<HomeComponent>;
  let component: HomeComponent;

  function createComponent(userName: string | null): void {
    const authServiceSpy = jasmine.createSpyObj<AuthService>(
      'AuthService',
      [],
      {
        currentUser: signal(
          userName
            ? { id: 1, name: userName, accessType: 'Administrator' }
            : null,
        ),
      },
    );

    TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceSpy },
      ],
    });

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('greets the logged-in user by their first name', () => {
    createComponent('Camila Andrade');

    expect(component.firstName()).toBe('Camila');
    expect(
      fixture.nativeElement.querySelector('.greeting-title').textContent,
    ).toContain('Camila');
  });

  it('does not blow up when there is no logged-in user yet', () => {
    createComponent(null);

    expect(component.firstName()).toBe('');
  });

  it('renders one card per mock stat, quick action, reminder and room', () => {
    createComponent('Camila Andrade');

    expect(fixture.nativeElement.querySelectorAll('.stat-card').length).toBe(
      component.stats.length,
    );
    // +1 for the "+ Novo gatinho" link, which isn't in the mock quickActions array.
    expect(fixture.nativeElement.querySelectorAll('.quick-action').length).toBe(
      component.quickActions.length + 1,
    );
    expect(fixture.nativeElement.querySelectorAll('.reminder-row').length).toBe(
      component.reminders.length,
    );
    expect(
      fixture.nativeElement.querySelectorAll('.occupancy-row').length,
    ).toBe(component.roomOccupancy.length);
    // +1 for the header row.
    expect(fixture.nativeElement.querySelectorAll('.activity-row').length).toBe(
      component.activity.length + 1,
    );
  });

  it('computes the occupancy percentage from occupied/capacity', () => {
    createComponent('Camila Andrade');

    expect(
      component.occupancyPercent({
        name: 'x',
        occupied: 14,
        capacity: 16,
        tone: 'primary',
      }),
    ).toBe(88);
  });

  it('builds initials the same way the shared avatar does, with the same edge cases', () => {
    createComponent('Camila Andrade');

    expect(component.initialsOf('Juliana Torres')).toBe('JT');
    expect(component.initialsOf('Camila')).toBe('C');
    expect(component.initialsOf('   ')).toBe('?');
  });
});
