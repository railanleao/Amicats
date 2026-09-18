import { Routes } from '@angular/router';

import { UsuariosComponent } from '../pages/users/users.component';

export const routes: Routes = [
  {
    path: 'usuarios',
    component: UsuariosComponent,
  },

  {
    path: '',
    redirectTo: 'usuarios',
    pathMatch: 'full',
  },
];
