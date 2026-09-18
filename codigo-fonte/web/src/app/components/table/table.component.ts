import { Component, EventEmitter, Input, Output } from '@angular/core';

import { User } from '../../pages/users/users.component';

@Component({
  selector: 'app-table',
  standalone: true,
  templateUrl: './table.component.html',
  styleUrl: './table.component.css',
})
export class TableComponent {
  @Input() users: User[] = [];
  @Output() edit = new EventEmitter<number>();
  @Output() delete = new EventEmitter<number>();

  openMenuIndex: number | null = null;

  // Opens or closes the three-dot menu

  openMenu(index: number): void {
    if (this.openMenuIndex === index) {
      this.openMenuIndex = null;
    } else {
      this.openMenuIndex = index;
    }
  }

  // Edit user

  editUser(index: number): void {
    this.openMenuIndex = null;
    this.edit.emit(index);
  }

  // Delete user

  deleteUser(index: number): void {
    this.openMenuIndex = null;
    this.delete.emit(index);
  }

  // Formats the phone number for the table

  formatPhone(phone: string): string {
    const number = phone.replace(/\D/g, '');

    if (number.length === 11) {
      return `(${number.substring(0, 2)}) ${number.substring(2, 7)}-${number.substring(7)}`;
    }
    if (number.length === 10) {
      return `(${number.substring(0, 2)}) ${number.substring(2, 6)}-${number.substring(6)}`;
    }
    return phone;
  }
}
