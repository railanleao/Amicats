import { Routes } from '@angular/router';

import { authGuard } from './guards/auth.guard';
import { changePasswordGuard } from './guards/change-password.guard';
import { termsAcceptanceGuard } from './guards/terms-acceptance.guard';
import { ChangePasswordComponent } from './pages/change-password/change-password.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { TermsAcceptanceComponent } from './pages/terms-acceptance/terms-acceptance.component';
import { UsersComponent } from './pages/users/users.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, canActivate: [authGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'recuperar-senha', component: ForgotPasswordComponent },
  {
    path: 'termos-de-uso',
    component: TermsAcceptanceComponent,
    canActivate: [termsAcceptanceGuard],
  },
  {
    path: 'definir-nova-senha',
    component: ChangePasswordComponent,
    canActivate: [changePasswordGuard],
  },
  { path: 'users', component: UsersComponent, canActivate: [] },
  { path: '**', redirectTo: '' },
];
