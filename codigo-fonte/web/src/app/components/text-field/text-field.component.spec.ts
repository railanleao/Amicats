import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, Validators } from '@angular/forms';

import { TextFieldComponent } from './text-field.component';

describe('TextFieldComponent', () => {
  let fixture: ComponentFixture<TextFieldComponent>;
  let component: TextFieldComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextFieldComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TextFieldComponent);
    component = fixture.componentInstance;
    component.inputId = 'email';
    component.label = 'E-mail';
    component.control = new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    });
    component.errorMessages = {
      required: 'Campo obrigatório.',
      email: 'Informe um e-mail válido.',
    };
  });

  it('renders the label and links it to the input', () => {
    fixture.detectChanges();
    const label: HTMLLabelElement =
      fixture.nativeElement.querySelector('label');
    const input: HTMLInputElement =
      fixture.nativeElement.querySelector('input');

    expect(label.textContent).toContain('E-mail');
    expect(label.htmlFor).toBe('email');
    expect(input.id).toBe('email');
  });

  it('does not show an error message before the field is touched', () => {
    fixture.detectChanges();
    const error = fixture.nativeElement.querySelector('.text-field__error');

    expect(error).toBeNull();
  });

  it('shows the matching error message once the field is touched and invalid', () => {
    component.control.markAsTouched();
    fixture.detectChanges();

    const error: HTMLSpanElement =
      fixture.nativeElement.querySelector('.text-field__error');
    expect(error.textContent).toContain('Campo obrigatório.');
  });

  it('switches the error message as the validation error changes', () => {
    component.control.setValue('not-an-email');
    component.control.markAsTouched();
    fixture.detectChanges();

    const error: HTMLSpanElement =
      fixture.nativeElement.querySelector('.text-field__error');
    expect(error.textContent).toContain('Informe um e-mail válido.');
  });

  it('is editable by default', () => {
    fixture.detectChanges();
    const input: HTMLInputElement =
      fixture.nativeElement.querySelector('input');

    expect(input.readOnly).toBeFalse();
  });

  it('renders the input as read-only when readonly is set', () => {
    component.readonly = true;
    fixture.detectChanges();
    const input: HTMLInputElement =
      fixture.nativeElement.querySelector('input');

    expect(input.readOnly).toBeTrue();
  });

  it('shows the placeholder when one is given', () => {
    component.placeholder = 'nome@exemplo.com';
    fixture.detectChanges();
    const input: HTMLInputElement =
      fixture.nativeElement.querySelector('input');

    expect(input.placeholder).toBe('nome@exemplo.com');
  });

  it('has no placeholder by default', () => {
    fixture.detectChanges();
    const input: HTMLInputElement =
      fixture.nativeElement.querySelector('input');

    expect(input.placeholder).toBe('');
  });
});
