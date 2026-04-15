import { db } from './backend/src/db';
import { appointments, consultations } from './backend/src/db/schema';
import { sql } from 'drizzle-orm';

async function check() {
  const apts = await db.select().from(appointments);
  const cons = await db.select().from(consultations);
  
  console.log('--- Appointments ---');
  console.log(apts);
  
  console.log('--- Consultations ---');
  console.log(cons);
}

check();
