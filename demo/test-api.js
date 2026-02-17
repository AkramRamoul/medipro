
async function test() {
    try {
        console.log("Testing Login...");
        const loginRes = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'doc', password: '123' })
        });

        if (!loginRes.ok) {
            console.error('Login Failed Status:', loginRes.status);
            const text = await loginRes.text();
            console.error('Login Failed Body:', text);
            return;
        }

        const loginData = await loginRes.json();
        console.log('Login Success:', loginData);

        if (loginData.token) {
            const token = loginData.token;

            // 1. Fetch Patients
            console.log("\nTesting Fetch Patients...");
            const patientsRes = await fetch('http://localhost:3000/patients', {
                headers: { 'Authorization': token }
            });
            const patients = await patientsRes.json();
            console.log('Patients Retrieved:', patients.length);

            // 2. Create Patient
            console.log("\nTesting Create Patient...");
            const newPatient = {
                first_name: "Test",
                last_name: "User",
                age: 30,
                gender: "Male",
                contact: "555-0199",
                medical_history: "Testing"
            };
            const createRes = await fetch('http://localhost:3000/patients', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
                body: JSON.stringify(newPatient)
            });

            if (createRes.ok) {
                const createData = await createRes.json();
                console.log("Patient Created, ID:", createData.id);
            } else {
                console.error("Create Patient Failed:", await createRes.text());
            }

            // 3. Fetch Appointments
            console.log("\nTesting Fetch Appointments...");
            const apptRes = await fetch('http://localhost:3000/appointments', {
                headers: { 'Authorization': token }
            });
            if (apptRes.ok) {
                const appts = await apptRes.json();
                console.log("Appointments Retrieved:", appts.length);
                if (appts.length > 0) console.log(appts[0]);
            } else {
                console.error("Fetch Appointments Failed:", await apptRes.text());
            }
        }
    } catch (e) {
        console.error('Test Exception:', e);
    }
}

test();
