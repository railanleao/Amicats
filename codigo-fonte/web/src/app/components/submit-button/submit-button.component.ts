import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-submit-button',
  imports: [],
  templateUrl: './submit-button.component.html',
  styleUrl: './submit-button.component.css',
})
export class SubmitButtonComponent {
  @Input({ required: true }) label!: string;
  @Input() loadingLabel = 'Enviando...';
  @Input() loading = false;
  @Input() disabled = false;
}
