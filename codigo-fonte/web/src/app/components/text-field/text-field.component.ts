import { Component, Input } from '@angular/core';
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
