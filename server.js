/**
 * RouteIQ One | Enterprise Backend Server
 * ---------------------------------------
 * Handles persistent storage via SQLite, AI route analysis simulation,
 * and data serving for the logistics dashboard.
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware configuration
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, './')));

// Database Initialization (Persistent SQLite)
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) console.error('CRITICAL: DB Connection Error:', err.message);
    else console.log('✓ Database Core: Connected to database.db');
});

// System Initialization: Schema & Seed Data
db.serialize(() => {
    // 1. User Profile Table
    db.run(`CREATE TABLE IF NOT EXISTS profile (
        id INTEGER PRIMARY KEY,
        name TEXT,
        role TEXT,
        email TEXT,
        empId TEXT,
        avatar TEXT
    )`);

    // 2. Fleet Repository Table
    db.run(`CREATE TABLE IF NOT EXISTS fleet (
        id TEXT PRIMARY KEY,
        type TEXT,
        status TEXT,
        driver TEXT,
        fuel TEXT
    )`);

    // 3. System Notifications Table
    db.run(`CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT,
        title TEXT,
        time TEXT,
        text TEXT
    )`);

    // Seed Data (Only if tables are empty)
    db.get("SELECT count(*) as count FROM profile", (err, row) => {
        if (row && row.count === 0) {
            db.run(`INSERT INTO profile (id, name, role, email, empId, avatar) 
                    VALUES (1, 'Admin User', 'Global Logistics Director', 'admin@routeiq-one.ai', 'RT-IQ-00124', 'https://ui-avatars.com/api/?name=Admin+User&background=06b6d4&color=fff')`);
        }
    });

    db.get("SELECT count(*) as count FROM fleet", (err, row) => {
        if (row && row.count === 0) {
            const stmt = db.prepare("INSERT INTO fleet VALUES (?, ?, ?, ?, ?)");
            const fleet = [
                ['RG-8802', 'Semi-Truck', 'On Time', 'Alex Rivera', '82%'],
                ['RG-CS-12', 'Cargo Ship', 'Delayed', 'Capt. Jensen', '41%'],
                ['RG-VN-412', 'Delivery Van', 'On Time', 'Sarah Chen', '95%'],
                ['RG-HD-901', 'Heavy Duty', 'Standby', 'Marcus Thorne', '60%']
            ];
            fleet.forEach(v => stmt.run(v));
            stmt.finalize();
        }
    });

    db.get("SELECT count(*) as count FROM notifications", (err, row) => {
        if (row && row.count === 0) {
            const stmt = db.prepare("INSERT INTO notifications (type, title, time, text) VALUES (?, ?, ?, ?)");
            const notes = [
                ['critical', 'FLOOD RISK', '2m ago', 'Heavy precipitation in Dresden. Route A sub-merged risk 85%.'],
                ['warning', 'TRAFFIC', '14m ago', 'Major pileup on A12. Expected delay +45 mins for all heavy fleet.'],
                ['info', 'STRIKE ALERT', '1h ago', 'Port of Hamburg wildcat strike. Loading operations suspended.']
            ];
            notes.forEach(n => stmt.run(n));
            stmt.finalize();
        }
    });
});

// --- API ENDPOINTS ---

/**
 * Account & Profile Management
 */
app.get('/api/profile', (req, res) => {
    db.get("SELECT * FROM profile WHERE id = 1", (err, row) => {
        if (err) res.status(500).json({ error: err.message });
        else res.json(row);
    });
});

app.put('/api/profile', (req, res) => {
    const { name, role, email } = req.body;
    db.run(`UPDATE profile SET name = ?, role = ?, email = ? WHERE id = 1`, [name, role, email], function(err) {
        if (err) res.status(500).json({ error: err.message });
        else res.json({ success: true });
    });
});

/**
 * Fleet & Assets Management
 */
app.get('/api/fleet', (req, res) => {
    db.all("SELECT * FROM fleet", (err, rows) => {
        if (err) res.status(500).json({ error: err.message });
        else res.json(rows);
    });
});

app.post('/api/fleet', (req, res) => {
    const { id, type, status, driver, fuel } = req.body;
    db.run(`INSERT INTO fleet (id, type, status, driver, fuel) VALUES (?, ?, ?, ?, ?)`, 
           [id, type, status, driver, fuel], function(err) {
        if (err) res.status(500).json({ error: err.message });
        else res.json({ success: true });
    });
});

/**
 * Intelligence & Analytics
 */
app.get('/api/notifications', (req, res) => {
    db.all("SELECT * FROM notifications ORDER BY id DESC", (err, rows) => {
        if (err) res.status(500).json({ error: err.message });
        else res.json(rows);
    });
});

app.get('/api/analytics', (req, res) => {
    res.json({
        efficiency: [92, 88, 95, 94, 91, 98],
        riskDistribution: [75, 20, 5],
        fuelConsumption: [420, 380, 450, 410, 390, 360],
        regionalEfficiency: [85, 92, 78, 88, 90],
        fleetUtilization: [12, 5, 8], // Standard, Heavy, Refrigerated
        monthlyGrowth: "+12.4%"
    });
});

/**
 * Simulated AI Risk Engine
 */
app.post('/api/analyze-route', (req, res) => {
    const { distance, duration, cargoType, priority } = req.body;
    let riskScore = 15;
    let insights = [{ icon: 'fa-microchip', text: 'Persistent Data Core Analysis Complete.' }];

    const hours = duration / 3600;
    if (hours > 6) {
        riskScore += 30;
        insights.push({ type: 'danger', icon: 'fa-bed', text: 'Long-haul fatigue threshold exceeded.' });
    }
    if (cargoType === 'hazmat') {
        riskScore += 20;
        insights.push({ type: 'danger', icon: 'fa-biohazard', text: 'Hazardous cargo protocol active.' });
    }

    res.json({ riskScore: Math.min(riskScore, 100), insights });
});

// Single Page Application (SPA) - Serve index for all unknown routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, './index.html'));
});

// Start the operational server
app.listen(PORT, () => {
    console.log(`✓ RouteIQ One: Operational at http://localhost:${PORT}`);
    console.log(`✓ Status: FULL STACK | SQLITE PERSISTENCE ACTIVE`);
});
