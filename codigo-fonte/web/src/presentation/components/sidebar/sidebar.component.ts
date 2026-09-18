import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  usuarioLogado = {
    nome: 'Nome do Usuário',
    perfil: 'Administradora',
  };

  constructor(private router: Router) {}

  desconectar(): void {
    this.router.navigate(['/login']);
  }
}
