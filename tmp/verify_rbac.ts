import { ConsultationService } from '../backend/src/services/consultation.service';
import { Role } from '../backend/src/middleware/role.middleware';

async function verifyRBAC() {
    const service = new ConsultationService();
    const mockConsultation = {
        id: 1,
        reason: 'Flu symptoms',
        diagnosis: 'Common cold',
        notes: 'Take rest',
        symptoms: 'Cough, fever',
        customFields: { clinical: 'secret' }
    };

    console.log('--- Verification Started ---');

    console.log('\nTesting Role: doctor');
    const doctorView = (service as any).maskConsultation(mockConsultation, 'doctor');
    console.log('Reason masked:', doctorView.reason === '[SENSITIVE]');
    if (doctorView.reason === 'Flu symptoms') console.log('PASS: Doctor can see reason');

    console.log('\nTesting Role: receptionist');
    const receptionistView = (service as any).maskConsultation(mockConsultation, 'receptionist');
    console.log('Reason masked:', receptionistView.reason === '[SENSITIVE]');
    if (receptionistView.reason === '[SENSITIVE]') console.log('PASS: Receptionist cannot see reason');
    console.log('Diagnosis masked:', receptionistView.diagnosis === '[SENSITIVE]');
    console.log('Notes masked:', receptionistView.notes === '[SENSITIVE]');
    console.log('CustomFields empty:', Object.keys(receptionistView.customFields).length === 0);

    console.log('\n--- Verification Finished ---');
}

verifyRBAC().catch(console.error);
