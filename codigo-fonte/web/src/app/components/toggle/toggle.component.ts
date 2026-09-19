import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-toggle',
  standalone: true,
  imports: [],
  templateUrl: './toggle.component.html',
  styleUrl: './toggle.component.css',
})
export class ToggleComponent {
  @Input({ required: true }) label!: string;
  @Input() checked = false;
  @Input() disabled = false;
  @Input() hint = '';

  @Output() readonly toggled = new EventEmitter<void>();

  onClick(): void {
    if (!this.disabled) {
      this.toggled.emit();
    }
  }
}
