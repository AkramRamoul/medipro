export type Patient = {
  id: number;
  name: string;
  age: number;
  gender: string;
  contact: string;
  address?: string;
  weight?: number;
  bloodType?: string;
  medicalHistory?: string;
  allergies?: string;
  notes?: string;
  createdAt: string; // "YYYY-MM-DD"
};
