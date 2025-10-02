const db = require('./index');
const User = require('../models/User');
const Event = require('../models/Event');
const Insurance = require('../models/Insurance');
const { v4: uuidv4 } = require('uuid');

async function initializeDatabase() {
    try {
        // Initialize database connection
        await db.initializeDB();

        // Create users table
        await db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                points INTEGER DEFAULT 0,
                level INTEGER DEFAULT 1,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create events table
        await db.run(`
            CREATE TABLE IF NOT EXISTS events (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                event_type TEXT NOT NULL,
                points_awarded INTEGER NOT NULL,
                metadata TEXT,
                timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )
        `);

        // Initialize insurance tables
        await Insurance.initialize();

        // Create sample insurance plans
        const plans = [
            {
                id: uuidv4(),
                name: "Basic Health Coverage",
                type: "BASIC",
                premium: 200.00,
                coverage: 100000.00,
                features: {
                    medicalCoverage: true,
                    emergencyServices: true,
                    prescriptionDrugs: true,
                    annualCheckup: true
                },
                maxDiscount: 15
            },
            {
                id: uuidv4(),
                name: "Premium Health Plan",
                type: "PREMIUM",
                premium: 350.00,
                coverage: 250000.00,
                features: {
                    medicalCoverage: true,
                    emergencyServices: true,
                    prescriptionDrugs: true,
                    annualCheckup: true,
                    specialistConsultations: true,
                    mentalHealth: true,
                    preventiveCare: true,
                    wellnessPrograms: true
                },
                maxDiscount: 25
            },
            {
                id: uuidv4(),
                name: "Family Coverage",
                type: "FAMILY",
                premium: 500.00,
                coverage: 500000.00,
                features: {
                    medicalCoverage: true,
                    emergencyServices: true,
                    prescriptionDrugs: true,
                    annualCheckup: true,
                    specialistConsultations: true,
                    mentalHealth: true,
                    preventiveCare: true,
                    wellnessPrograms: true,
                    maternityBenefits: true,
                    dentalAndVision: true,
                    familyCheckups: true
                },
                maxDiscount: 30
            }
        ];

        for (const plan of plans) {
            await Insurance.createPlan(plan);
        }

        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }
}

module.exports = { initializeDatabase };