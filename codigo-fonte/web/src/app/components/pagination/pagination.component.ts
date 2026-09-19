import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.css',
})
export class PaginationComponent {
  @Input({ required: true }) page = 0;
  @Input({ required: true }) size = 20;
  @Input({ required: true }) totalPages = 0;
  @Input({ required: true }) totalElements = 0;
  @Input() itemLabel = 'itens';

  @Output() readonly pageChange = new EventEmitter<number>();

  get hasPreviousPage(): boolean {
    return this.page > 0;
  }

  get hasNextPage(): boolean {
    return this.page + 1 < this.totalPages;
  }

  get rangeStart(): number {
    return this.totalElements === 0 ? 0 : this.page * this.size + 1;
  }

  get rangeEnd(): number {
    return Math.min((this.page + 1) * this.size, this.totalElements);
  }

  get displayedTotalPages(): number {
    return Math.max(this.totalPages, 1);
  }

  goToPrevious(): void {
    if (this.hasPreviousPage) {
      this.pageChange.emit(this.page - 1);
    }
  }

  goToNext(): void {
    if (this.hasNextPage) {
      this.pageChange.emit(this.page + 1);
    }
  }
}
