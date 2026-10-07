import { Component, input } from '@angular/core';

export type IconName =
  | 'dashboard'
  | 'search'
  | 'user'
  | 'room'
  | 'cat'
  | 'volunteers'
  | 'partners'
  | 'records'
  | 'medication'
  | 'stock'
  | 'vaccine'
  | 'adoption'
  | 'reports'
  | 'sync';

@Component({
  selector: 'app-icon',
  standalone: true,
  templateUrl: './icon.component.html',
  styleUrl: './icon.component.css',
})
export class IconComponent {
  readonly name = input.required<IconName>();
}
