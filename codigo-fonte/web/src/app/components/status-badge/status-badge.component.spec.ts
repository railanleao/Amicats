import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusBadgeComponent } from './status-badge.component';

describe('StatusBadgeComponent', () => {
  let fixture: ComponentFixture<StatusBadgeComponent>;

  function badge(): HTMLElement {
    return fixture.nativeElement.querySelector('.status-badge');
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusBadgeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StatusBadgeComponent);
    fixture.componentRef.setInput('label', 'Sincronizado');
  });

  it('renders the label', () => {
    fixture.detectChanges();

    expect(badge().textContent?.trim()).toBe('Sincronizado');
  });

  it('defaults to the neutral tone', () => {
    fixture.detectChanges();

    expect(badge().classList).toContain('status-badge--neutral');
  });

  it('applies the requested tone', () => {
    fixture.componentRef.setInput('tone', 'warning');
    fixture.detectChanges();

    expect(badge().classList).toContain('status-badge--warning');
    expect(badge().classList).not.toContain('status-badge--neutral');
  });
});
