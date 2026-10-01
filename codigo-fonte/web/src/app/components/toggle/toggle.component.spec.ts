import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToggleComponent } from './toggle.component';

describe('ToggleComponent', () => {
  let fixture: ComponentFixture<ToggleComponent>;
  let component: ToggleComponent;

  function button(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('button');
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToggleComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ToggleComponent);
    component = fixture.componentInstance;
    component.label = 'Status de Marina';
    fixture.detectChanges();
  });

  it('exposes the switch role and the accessible label', () => {
    expect(button().getAttribute('role')).toBe('switch');
    expect(button().getAttribute('aria-label')).toBe('Status de Marina');
  });

  it('reflects the checked state in aria-checked and in the visual class', () => {
    expect(button().getAttribute('aria-checked')).toBe('false');
    expect(button().classList).not.toContain('toggle--on');

    component.checked = true;
    fixture.detectChanges();

    expect(button().getAttribute('aria-checked')).toBe('true');
    expect(button().classList).toContain('toggle--on');
  });

  it('emits toggled when clicked', () => {
    let emitted = 0;
    component.toggled.subscribe(() => emitted++);

    button().click();

    expect(emitted).toBe(1);
  });

  it('does not change its own state when clicked', () => {
    button().click();
    fixture.detectChanges();

    expect(component.checked).toBeFalse();
    expect(button().getAttribute('aria-checked')).toBe('false');
  });

  it('is disabled and emits nothing when disabled', () => {
    component.disabled = true;
    fixture.detectChanges();
    let emitted = 0;
    component.toggled.subscribe(() => emitted++);

    button().click();

    expect(button().disabled).toBeTrue();
    expect(emitted).toBe(0);
  });

  it('shows the hint as a tooltip when provided', () => {
    component.hint = 'Desativar usuário';
    fixture.detectChanges();

    const wrapper: HTMLElement =
      fixture.nativeElement.querySelector('.toggle-wrapper');
    expect(wrapper.getAttribute('title')).toBe('Desativar usuário');
  });
});
