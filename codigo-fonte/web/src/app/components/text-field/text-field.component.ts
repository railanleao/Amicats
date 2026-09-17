import { Component, Input, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-text-field',
  imports: [ReactiveFormsModule],
  templateUrl: './text-field.component.html',
  styleUrl: './text-field.component.css',
})
export class TextFieldComponent {
  @Input({ required: true }) inputId!: string;
  @Input({ required: true }) label!: string;
  @Input({ required: true }) control!: FormControl<string>;
  @Input() type: 'text' | 'email' | 'password' = 'text';
  @Input() autocomplete = 'on';
  @Input() errorMessages: Record<string, string> = {};

  private readonly passwordVisible = signal(false);

  get isPasswordField(): boolean {
    return this.type === 'password';
  }

  get effectiveType(): 'text' | 'email' | 'password' {
    if (!this.isPasswordField) {
      return this.type;
    }
    return this.passwordVisible() ? 'text' : 'password';
  }

  get isPasswordVisible(): boolean {
    return this.passwordVisible();
  }

  togglePasswordVisibility(): void {
    this.passwordVisible.update((visible) => !visible);
  }

  get errorMessage(): string | null {
    const errors = this.control.errors;
    if (!errors) {
      return null;
    }

    const matchingKey = Object.keys(errors).find(
      (key) => key in this.errorMessages,
    );
    return matchingKey ? this.errorMessages[matchingKey] : null;
  }
}
