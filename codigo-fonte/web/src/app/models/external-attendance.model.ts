export interface CreateExternalAttendanceRequest {
  catId: number;
  partnerClinic: string;
  veterinarian: string;
  crmv: string;
  attendanceDate: string;
  diagnosis: string;
  attachedFile: string;
}

export interface ExternalAttendance {
  id: number;
  catId: number;
  partnerClinic: string;
  veterinarian: string;
  crmv: string;
  attendanceDate: string;
  diagnosis: string;
  attachedFile: string;
  createdAt: string;
}
