import { db } from '../src/db';
import { patients, consultations, appointments, expenses } from '../src/db/schema';
import { faker } from '@faker-js/faker';
import { subDays, addDays, format } from 'date-fns';

async function seedDashboard() {
    console.log('🌱 Starting dashboard data seeding...');

    // 1. Seed Patients
    const patientIds: number[] = [];
    console.log('👤 Seeding 30 patients...');
    for (let i = 0; i < 30; i++) {
        const [patient] = await db.insert(patients).values({
            first_name: faker.person.firstName(),
            last_name: faker.person.lastName(),
            age: faker.number.int({ min: 1, max: 90 }),
            gender: faker.helpers.arrayElement(['male', 'female']),
            contact: faker.phone.number(),
            address: faker.location.streetAddress(),
            status: faker.helpers.arrayElement(['active', 'active', 'inactive']), // Most are active
        }).returning({ id: patients.id });
        patientIds.push(patient.id);
    }

    // 2. Seed Consultations (Revenue)
    console.log('🩺 Seeding 100 consultations...');
    const diagnoses = ['Cold', 'Flu', 'Hypertension', 'Diabetes', 'Annual Checkup', 'Back Pain', 'Migraine', 'Asthma', 'Allergy', 'Fatigue'];
    for (let i = 0; i < 100; i++) {
        const randomDate = subDays(new Date(), faker.number.int({ min: 0, max: 30 }));
        await db.insert(consultations).values({
            patientId: faker.helpers.arrayElement(patientIds),
            date: randomDate.toISOString(),
            reason: faker.lorem.sentence(),
            diagnosis: faker.helpers.arrayElement(diagnoses),
            amountPaid: faker.number.int({ min: 500, max: 5000 }),
            status: 'completed',
        });
    }

    // 3. Seed Appointments
    console.log('📅 Seeding 50 appointments...');
    for (let i = 0; i < 50; i++) {
        // Range: last 30 days to next 7 days
        const randomDate = faker.helpers.arrayElement([
            subDays(new Date(), faker.number.int({ min: 0, max: 30 })),
            addDays(new Date(), faker.number.int({ min: 1, max: 7 }))
        ]);

        await db.insert(appointments).values({
            patientId: faker.helpers.arrayElement(patientIds),
            date: format(randomDate, 'yyyy-MM-dd'),
            time: `${faker.number.int({ min: 8, max: 17 }).toString().padStart(2, '0')}:${faker.helpers.arrayElement(['00', '15', '30', '45'])}`,
            title: faker.helpers.arrayElement(['Consultation', 'Follow-up', 'Emergency', 'Routine Check']),
            status: randomDate < new Date() ? 'completed' : 'scheduled',
        });
    }

    // 4. Seed Expenses
    console.log('💸 Seeding 20 expenses...');
    const expenseCategories = ['Rent', 'Supplies', 'Utilities', 'Maintenance', 'Marketing', 'Insurance'];
    for (let i = 0; i < 20; i++) {
        const randomDate = subDays(new Date(), faker.number.int({ min: 0, max: 30 }));
        await db.insert(expenses).values({
            description: faker.commerce.productName(),
            amount: faker.number.int({ min: 2000, max: 50000 }),
            category: faker.helpers.arrayElement(expenseCategories),
            date: randomDate.toISOString(),
        });
    }

    console.log('✨ Dashboard seeding complete!');
    process.exit(0);
}

seedDashboard().catch(err => {
    console.error('❌ Error during dashboard seeding:', err);
    process.exit(1);
});
