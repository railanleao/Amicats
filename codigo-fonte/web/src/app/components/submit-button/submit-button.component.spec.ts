import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmitButtonComponent } from './submit-button.component';

describe('SubmitButtonComponent', () => {
  let fixture: ComponentFixture<SubmitButtonComponent>;
  let component: SubmitButtonComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubmitButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SubmitButtonComponent);
    component = fixture.componentInstance;
    component.label = 'Entrar';
  });

  it('renders the label and is enabled by default', () => {
    fixture.detectChanges();
    const button: HTMLButtonElement =
      fixture.nativeElement.querySelector('button');

    expect(button.textContent?.trim()).toBe('Entrar');
    expect(button.disabled).toBeFalse();
  });

  it('shows the loading label and disables the button while loading', () => {
    component.loading = true;
    component.loadingLabel = 'Entrando...';
    fixture.detectChanges();

    const button: HTMLButtonElement =
      fixture.nativeElement.querySelector('button');
    expect(button.textContent?.trim()).toBe('Entrando...');
    expect(button.disabled).toBeTrue();
  });

  it('disables the button when disabled is set, independent of loading', () => {
    component.disabled = true;
    fixture.detectChanges();

    const button: HTMLButtonElement =
      fixture.nativeElement.querySelector('button');
    expect(button.disabled).toBeTrue();
  });
});
