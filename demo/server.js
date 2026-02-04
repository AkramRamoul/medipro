const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Middleware
import cors from "cors";

app.use(cors({
    origin: "*",
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(bodyParser.json());
app.use(express.static(__dirname)); // Serve static files (index.html) from current directory

// In-memory Database
let patients = [
    { id: 1, name: "John Doe", age: 30, condition: "Flu" },
    { id: 2, name: "Jane Smith", age: 45, condition: "Hypertension" },
    { id: 3, name: "Bob Johnson", age: 60, condition: "Diabetes" }
];

// Users & Roles
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

// GET /patients - Standard access
app.get('/patients', authenticate, (req, res) => {
    console.log(`[GET] /patients requested by ${req.user.username} (${req.user.role})`);
    res.json(patients);
});

// PUT /patients/:id - Secretary can update, but we could restrict specific fields if needed
app.put('/patients/:id', authenticate, (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    console.log(`[PUT] /patients/${id} requested by ${req.user.username} (${req.user.role})`);

    // Find patient
    const index = patients.findIndex(p => p.id == id);
    if (index === -1) return res.status(404).json({ error: "Patient not found" });

    // Update
    patients[index] = { ...patients[index], ...updates };

    res.json({ success: true, patient: patients[index] });
});

// DELETE /patients/:id - DOCOTR ONLY
app.delete('/patients/:id', authenticate, (req, res) => {
    console.log(`[DELETE] /patients/${req.params.id} requested by ${req.user.username} (${req.user.role})`);

    if (req.user.role !== 'doctor') {
        return res.status(403).json({ error: "Access Denied: Only Doctors can delete records." });
    }

    const { id } = req.params;
    patients = patients.filter(p => p.id != id);
    res.json({ success: true, message: "Patient deleted" });
});

// Fallback: Serve index.html for any other route (e.g., if user types /login)
app.get('*', (req, res) => {
    res.sendFile(require('path').join(__dirname, 'index.html'));
});

// Start Server
app.listen(3000, "0.0.0.0", () => {
    console.log("Server running on port 3000");
});

