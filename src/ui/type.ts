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

export type Consultation = {
  id: string; // Unique identifier for the consultation
  patientId: string; // Foreign key to link to the patient
  reason: string; // Reason for the visit
  symptoms: string; // Description of symptoms
  diagnosis: string; // Doctor's diagnosis
  notes?: string; // Optional additional notes
  date: string; // Timestamp for when the consultation was created
};
