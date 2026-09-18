import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { DashboardLayoutComponent } from '../../layouts/dashboard-layout/dashboard-layout.component';
import { TableComponent } from '../../components/table/table.component';

export interface User {
  nome: string;
  email: string;
  telefone: string;
  perfil: 'Administrador' | 'Veterinário' | 'Voluntário';
  status: 'Ativo' | 'Inativo';
  foto?: string;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [FormsModule, DashboardLayoutComponent, TableComponent],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css',
})
export class UsersComponent {
  mostrarFormulario = false;
  modoEdicao = false;
  usuarioEditandoIndex: number | null = null;
  users: User[] = [];
  novoUsuario: User = {
    nome: '',
    email: '',
    telefone: '',
    perfil: 'Voluntário',
    status: 'Ativo',
    foto: '',
  };

  abrirFormulario(): void {
    this.modoEdicao = false;
    this.usuarioEditandoIndex = null;
    this.limparFormulario();
    this.mostrarFormulario = true;
  }

  editarUsuario(index: number): void {
    this.modoEdicao = true;
    this.usuarioEditandoIndex = index;

    this.novoUsuario = {
      ...this.users[index],
    };
    this.mostrarFormulario = true;
  }

  excluirUsuario(index: number): void {
    this.users.splice(index, 1);
  }

  fecharFormulario(): void {
    this.mostrarFormulario = false;
    this.modoEdicao = false;
    this.usuarioEditandoIndex = null;
    this.limparFormulario();
  }

  cadastrarUsuario(): void {
    if (
      !this.novoUsuario.nome ||
      !this.novoUsuario.email ||
      !this.novoUsuario.telefone ||
      !this.emailValido()
    ) {
      return;
    }

    if (this.modoEdicao && this.usuarioEditandoIndex !== null) {
      this.users[this.usuarioEditandoIndex] = {
        ...this.novoUsuario,
      };
    } else {
      this.users.push({
        ...this.novoUsuario,
      });
    }
    this.fecharFormulario();
  }

  emailValido(): boolean {
    const email = this.novoUsuario.email;

    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    return regex.test(email);
  }

  formatarTelefoneInput(): void {
    let telefone = this.novoUsuario.telefone.replace(/\D/g, '');

    if (telefone.length > 11) {
      telefone = telefone.substring(0, 11);
    }

    if (telefone.length > 6) {
      this.novoUsuario.telefone = `(${telefone.substring(0, 2)}) ${telefone.substring(2, 7)}-${telefone.substring(7)}`;
    } else if (telefone.length > 2) {
      this.novoUsuario.telefone = `(${telefone.substring(0, 2)}) ${telefone.substring(2)}`;
    } else if (telefone.length > 0) {
      this.novoUsuario.telefone = `(${telefone}`;
    } else {
      this.novoUsuario.telefone = '';
    }
  }

  selecionarFoto(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    const arquivo = input.files[0];

    if (!arquivo.type.startsWith('image/')) {
      return;
    }

    const leitor = new FileReader();

    leitor.onload = () => {
      this.novoUsuario.foto = leitor.result as string;
    };
    leitor.readAsDataURL(arquivo);
  }

  removerFoto(): void {
    this.novoUsuario.foto = '';
  }

  limparFormulario(): void {
    this.novoUsuario = {
      nome: '',
      email: '',
      telefone: '',
      perfil: 'Voluntário',
      status: 'Ativo',
      foto: '',
    };
  }
}
