import { Component, Input } from '@angular/core';

export type StatusBadgeTone = 'success' | 'warning' | 'danger' | 'neutral';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  templateUrl: './status-badge.component.html',
  styleUrl: './status-badge.component.css',
})
export class StatusBadgeComponent {
  @Input({ required: true }) label!: string;
  @Input() tone: StatusBadgeTone = 'neutral';
}
