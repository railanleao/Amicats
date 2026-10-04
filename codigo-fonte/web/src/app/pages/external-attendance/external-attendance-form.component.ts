import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardLayoutComponent } from '../../components/auth-layout/dashboard-layout.component';

@Component({
  selector: 'app-external-attendance-form',
  standalone: true,
  imports: [CommonModule, FormsModule, DashboardLayoutComponent],
  templateUrl: './external-attendance-form.component.html',
  styleUrls: ['./external-attendance-form.component.css'],
})
export class ExternalAttendanceFormComponent {
  externalAttendance = {
    cat: 'Zeca',
    partnerClinic: 'Clínica VetAmigo',
    veterinarian: 'Dr. Marcos Teixeira',
    crmv: '54321 / SP',
    attendanceDate: '03/09/2026',
    diagnosis:
      'Atendimento de emergência por trauma leve na pata dianteira. Radiografia sem fratura, prescrito repouso.',
    attachedFile: 'radiografia-zeca-030926.pdf',
  };

  cats = ['Zeca', 'Mingau', 'Luna', 'Mel'];

  partnerClinics = [
    'Clínica VetAmigo',
    'Clínica Animal Care',
    'Hospital Veterinário Amicats',
  ];

  selectFile(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.externalAttendance.attachedFile = input.files[0].name;
    }
  }

  cancel(): void {
    console.log('Canceling external attendance');
  }

  saveAttendance(): void {
    console.log('Saving external attendance:', this.externalAttendance);
  }
}
