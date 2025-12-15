// src/types/patient.ts
export interface Patient {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  birthDate?: string; // AAAA-MM-DD
}
