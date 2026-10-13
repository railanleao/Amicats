import { Component, Input } from '@angular/core';

import {
  STOCK_STATUS_LABELS,
  StockStatus,
} from '../../models/stock.model';

@Component({
  selector: 'app-stock-status-badge',
  standalone: true,
  imports: [],
  templateUrl: './stock-status-badge.component.html',
  styleUrl: './stock-status-badge.component.css',
})
export class StockStatusBadgeComponent {
  @Input({ required: true }) status!: StockStatus;

  get label(): string {
    return STOCK_STATUS_LABELS[this.status];
  }
}
