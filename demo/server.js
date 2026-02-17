import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { networkInterfaces } from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3000;

// Middleware
app.use(cors({
    origin: "*",
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(bodyParser.json());
app.use(express.static(__dirname)); // Serve static files (index.html) from current directory

// Real Database Connection
const dbPath = join(__dirname, '../database.db');
const db = new Database(dbPath, { verbose: console.log });

// Users & Roles (Keep hardcoded for demo auth)
const USERS = {
    'doc': { password: '123', role: 'doctor', name: 'Dr. House' },
    'sec': { password: '123', role: 'secretary', name: 'Secretary Sarah' }
};

// --- AUTHENTICATION ---

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = USERS[username];

    if (user && user.password === password) {
        // In a real app, sign a JWT here. 
        // For demo, we just return a simple base64 "token" containing the role.
        const token = Buffer.from(`${username}:${user.role}`).toString('base64');
        res.json({ token, role: user.role, name: user.name });
    } else {
        res.status(401).json({ error: "Invalid credentials" });
    }
});

// Middleware to check auth
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "No token" });

    // Decode our simple demo token
    try {
        const decoded = Buffer.from(authHeader, 'base64').toString('utf8');
        const [username, role] = decoded.split(':');
        req.user = { username, role };
        next();
    } catch (e) {
        res.status(403).json({ error: "Invalid token" });
    }
};

// --- PATIENT ROUTES ---

// POST /patients - Create new patient (Secretary/Doctor)
app.post('/patients', authenticate, (req, res) => {
    console.log(`[POST] /patients requested by ${req.user.username} (${req.user.role})`);

    const { first_name, last_name, age, gender, contact, address, medical_history } = req.body;

    if (!first_name || !last_name || !age) {
        return res.status(400).json({ error: "Missing required fields (first_name, last_name, age)" });
    }

    try {
        const stmt = db.prepare(`
            INSERT INTO patients (first_name, last_name, age, gender, contact, address, medical_history)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        const info = stmt.run(first_name, last_name, parseInt(age), gender || 'Unknown', contact || '', address || '', medical_history || '');

        res.status(201).json({ success: true, id: info.lastInsertRowid });
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ error: "Failed to create patient" });
    }
});

// GET /patients - Standard access
app.get('/patients', authenticate, (req, res) => {
    console.log(`[GET] /patients requested by ${req.user.username} (${req.user.role})`);
    try {
        const stmt = db.prepare('SELECT id, first_name, last_name, age, medical_history FROM patients');
        const rows = stmt.all();

        // Map to demo format
        const patients = rows.map(row => ({
            id: row.id,
            name: `${row.first_name} ${row.last_name}`,
            age: row.age,
            condition: row.medical_history || 'N/A'
        }));

        res.json(patients);
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ error: "Failed to fetch patients" });
    }
});

// PUT /patients/:id - Secretary can update
app.put('/patients/:id', authenticate, (req, res) => {
    const { id } = req.params;
    const { name, age, condition } = req.body;

    console.log(`[PUT] /patients/${id} requested by ${req.user.username} (${req.user.role})`);

    // Helper to split name
    const nameParts = name ? name.trim().split(/\s+/) : [];
    const firstName = nameParts.length > 0 ? nameParts[0] : '';
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : ''; // simplistic

    try {
        // Check if patient exists
        const check = db.prepare('SELECT id FROM patients WHERE id = ?').get(id);
        if (!check) return res.status(404).json({ error: "Patient not found" });

        // Update
        // Note: We only update fields that are provided in the demo (Name, Age, Condition -> Medical History)
        // If name is not provided, we should probably keep old one, but for now I'll assume full payload or handle undefined.
        // But better-sqlite3 handles named parameters nicely.

        // Fetch current to merge if needed, but here we'll just update what we have.
        // Actually, if I update firstName/lastName from 'Name', I might overwrite existing correct split. 
        // But for this demo sync, this is the trade-off.

        const updateStmt = db.prepare(`
            UPDATE patients 
            SET first_name = COALESCE(?, first_name),
                last_name = COALESCE(?, last_name),
                age = COALESCE(?, age),
                medical_history = COALESCE(?, medical_history)
            WHERE id = ?
        `);

        updateStmt.run(firstName || null, lastName || null, age, condition, id);

        // Return updated object
        const updated = db.prepare('SELECT id, first_name, last_name, age, medical_history FROM patients WHERE id = ?').get(id);

        res.json({
            success: true,
            patient: {
                id: updated.id,
                name: `${updated.first_name} ${updated.last_name}`,
                age: updated.age,
                condition: updated.medical_history || 'N/A'
            }
        });

    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ error: "Failed to update patient" });
    }
});

// DELETE /patients/:id - DOCTOR ONLY
app.delete('/patients/:id', authenticate, (req, res) => {
    console.log(`[DELETE] /patients/${req.params.id} requested by ${req.user.username} (${req.user.role})`);

    if (req.user.role !== 'doctor') {
        return res.status(403).json({ error: "Access Denied: Only Doctors can delete records." });
    }

    const { id } = req.params;
    try {
        const result = db.prepare('DELETE FROM patients WHERE id = ?').run(id);
        if (result.changes === 0) return res.status(404).json({ error: "Patient not found" });

        res.json({ success: true, message: "Patient deleted" });
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ error: "Failed to delete patient" });
    }
});

// --- APPOINTMENT ROUTES ---

// GET /appointments - View all appointments
app.get('/appointments', authenticate, (req, res) => {
    console.log(`[GET] /appointments requested by ${req.user.username} (${req.user.role})`);
    try {
        const stmt = db.prepare(`
            SELECT a.id, a.date, a.title, a.status, p.first_name, p.last_name 
            FROM appointments a
            JOIN patients p ON a.patient_id = p.id
            ORDER BY a.date DESC
        `);
        const rows = stmt.all();

        const appointments = rows.map(row => ({
            id: row.id,
            patientName: `${row.first_name} ${row.last_name}`,
            date: row.date,
            title: row.title,
            status: row.status
        }));

        res.json(appointments);
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ error: "Failed to fetch appointments" });
    }
});


// Fallback: Serve index.html
app.get('*', (req, res) => {
    res.sendFile(join(__dirname, 'index.html'));
});

// Start Server
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Connected to database at ${dbPath}`);

    console.log("Available on:");
    const nets = networkInterfaces();
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                console.log(`  http://${net.address}:${PORT}`);
            }
        }
    }
});


