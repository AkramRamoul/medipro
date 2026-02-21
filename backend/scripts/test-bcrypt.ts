import bcrypt from 'bcryptjs';

const password = 'adminpassword';
const hash = '$2a$10$7zB3iYq.hY/D/8YqY8q8q8q8q8q8q8q8q8q8q8q8q8q8q8q8q8q8q'; // Dummy

async function test() {
    const hashed = await bcrypt.hash(password, 10);
    console.log('Test Hash:', hashed);
    const match = await bcrypt.compare(password, hashed);
    console.log('Test Match:', match);
}

test();
