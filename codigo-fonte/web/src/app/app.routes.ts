import { Routes } from '@angular/router';

import { authGuard } from './guards/auth.guard';
import { changePasswordGuard } from './guards/change-password.guard';
import { termsAcceptanceGuard } from './guards/terms-acceptance.guard';
import { DashboardLayoutComponent } from './components/auth-layout/dashboard-layout.component';
import { ChangePasswordComponent } from './pages/change-password/change-password.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { TermsAcceptanceComponent } from './pages/terms-acceptance/terms-acceptance.component';
import { UsersComponent } from './pages/users/users.component';
import { adminGuard } from './guards/admin.guard';
import { CatFormComponent } from './pages/cat-form/cat-form.component';
import { CatsComponent } from './pages/cats/cats.component';
import { UserFormComponent } from './pages/user-form/user-form.component';
import { RoomsComponent } from './pages/rooms/rooms.component';
import { RoomFormComponent } from './pages/room-form/room-form.component';
import { MedicalRecordsComponent } from './pages/medical-records/medical-records.component';

export const routes: Routes = [
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
  {
    path: '',
    component: DashboardLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', component: HomeComponent },
      { path: 'cats', component: CatsComponent },
      // No role guard here (unlike /users/new): cat creation is allowed for Administrator AND
      // Veterinarian (UC-06), and there's no existing guard for that combination. The backend
      // enforces it either way; a 403 just shows the form's generic error.
      { path: 'cats/new', component: CatFormComponent },
      { path: 'users', component: UsersComponent },
      {
        path: 'users/new',
        component: UserFormComponent,
        canActivate: [adminGuard],
        data: { mode: 'create' },
      },
      {
        path: 'users/:id/edit',
        component: UserFormComponent,
        canActivate: [adminGuard],
        data: { mode: 'edit' },
      },
      { path: 'rooms', component: RoomsComponent },
      {
        path: 'rooms/new',
        component: RoomFormComponent,
        canActivate: [adminGuard],
        data: { mode: 'create' },
      },
      {
        path: 'rooms/:id/edit',
        component: RoomFormComponent,
        canActivate: [adminGuard],
        data: { mode: 'edit' },
      },
      { path: 'medical-records', component: MedicalRecordsComponent },
    ],
  },
  { path: '**', redirectTo: '' },
];
