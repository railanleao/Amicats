import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.css',
})
export class ConfirmDialogComponent {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) message!: string;
  @Input() confirmLabel = 'Confirmar';
  @Input() cancelLabel = 'Cancelar';
  @Input() confirmLoading = false;
  @Input() confirmVariant: 'danger' | 'success' = 'danger';

  @Output() readonly confirmed = new EventEmitter<void>();
  @Output() readonly cancelled = new EventEmitter<void>();

  @HostListener('document:keydown.escape')
  onEscapePressed(): void {
    this.onCancel();
  }

  onConfirm(): void {
    if (!this.confirmLoading) {
      this.confirmed.emit();
    }
  }

  onCancel(): void {
    if (!this.confirmLoading) {
      this.cancelled.emit();
    }
  }
}
