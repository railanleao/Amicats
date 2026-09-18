import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { DashboardLayoutComponent } from '../../components/auth-layout/dashboard-layout.component';
import { TableComponent } from '../../components/table/table.component';

export interface User {
  name: string;
  email: string;
  phone: string;
  profile: 'Administrador' | 'Veterinário' | 'Voluntário';
  status: 'Ativo' | 'Inativo';
  photo?: string;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [ReactiveFormsModule, DashboardLayoutComponent, TableComponent],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css',
})
export class UsersComponent {
  showForm = false;
  editMode = false;
  userEditingIndex: number | null = null;

  users: User[] = [];

  userPhoto = '';

  userForm = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),

    email: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
      ],
    }),

    phone: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),

    profile: new FormControl<'Administrador' | 'Veterinário' | 'Voluntário'>(
      'Voluntário',
      {
        nonNullable: true,
        validators: [Validators.required],
      },
    ),

    status: new FormControl<'Ativo' | 'Inativo'>('Ativo', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  openForm(): void {
    this.editMode = false;
    this.userEditingIndex = null;

    this.cleanForm();

    this.showForm = true;
  }

  editUser(index: number): void {
    const user = this.users[index];

    this.editMode = true;
    this.userEditingIndex = index;

    this.userForm.patchValue({
      name: user.name,
      email: user.email,
      phone: user.phone,
      profile: user.profile,
      status: user.status,
    });

    this.userPhoto = user.photo ?? '';

    this.showForm = true;
  }

  deleteUser(index: number): void {
    this.users.splice(index, 1);
  }

  closeForm(): void {
    this.showForm = false;
    this.editMode = false;
    this.userEditingIndex = null;

    this.cleanForm();
  }

  registerUser(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    const user: User = {
      name: this.userForm.controls.name.value,
      email: this.userForm.controls.email.value,
      phone: this.userForm.controls.phone.value,
      profile: this.userForm.controls.profile.value,
      status: this.userForm.controls.status.value,
      photo: this.userPhoto,
    };

    if (this.editMode && this.userEditingIndex !== null) {
      this.users[this.userEditingIndex] = user;
    } else {
      this.users.push(user);
    }

    this.closeForm();
  }

  formatPhoneInput(): void {
    let telefone = this.userForm.controls.phone.value.replace(/\D/g, '');

    if (telefone.length > 11) {
      telefone = telefone.substring(0, 11);
    }

    if (telefone.length <= 2) {
      telefone = `(${telefone}`;
    } else if (telefone.length <= 7) {
      telefone = `(${telefone.substring(0, 2)}) ${telefone.substring(2)}`;
    } else {
      telefone =
        `(${telefone.substring(0, 2)}) ` +
        `${telefone.substring(2, 7)}-${telefone.substring(7)}`;
    }

    this.userForm.controls.phone.setValue(telefone);
  }

  selectPhoto(event: Event): void {
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
      this.userPhoto = leitor.result as string;
    };

    leitor.readAsDataURL(arquivo);
  }

  removePhoto(): void {
    this.userPhoto = '';
  }

  cleanForm(): void {
    this.userForm.reset({
      name: '',
      email: '',
      phone: '',
      profile: 'Voluntário',
      status: 'Ativo',
    });
    this.userPhoto = '';
  }
}
