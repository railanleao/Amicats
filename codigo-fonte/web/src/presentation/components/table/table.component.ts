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
  @Output() editar = new EventEmitter<number>();

  @Output() excluir = new EventEmitter<number>();

  menuAberto: number | null = null;

  // Abre ou fecha o menu dos três pontos
  abrirMenu(index: number): void {
    if (this.menuAberto === index) {
      this.menuAberto = null;
    } else {
      this.menuAberto = index;
    }
  }

  // Editar usuário
  editarUsuario(index: number): void {
    this.menuAberto = null;
    this.editar.emit(index);
  }

  // Excluir usuário
  excluirUsuario(index: number): void {
    this.menuAberto = null;
    this.excluir.emit(index);
  }

  // Formata telefone para a tabela
  formatarTelefone(telefone: string): string {
    const numeros = telefone.replace(/\D/g, '');

    if (numeros.length === 11) {
      return `(${numeros.substring(0, 2)}) ${numeros.substring(2, 7)}-${numeros.substring(7)}`;
    }

    if (numeros.length === 10) {
      return `(${numeros.substring(0, 2)}) ${numeros.substring(2, 6)}-${numeros.substring(6)}`;
    }
    return telefone;
  }
}
