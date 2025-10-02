const db = require('../db');

class Insurance {
    static async initialize() {
        await db.run(`
            CREATE TABLE IF NOT EXISTS insurance_plans (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                type TEXT NOT NULL,
                premium REAL NOT NULL,
                coverage REAL NOT NULL,
                features TEXT NOT NULL,
                max_discount INTEGER NOT NULL
            )
        `);

        await db.run(`
            CREATE TABLE IF NOT EXISTS user_insurance (
                id TEXT PRIMARY KEY,
                userId TEXT NOT NULL,
                planId TEXT NOT NULL,
                currentDiscount REAL DEFAULT 0,
                startDate TEXT NOT NULL,
                lastUpdateDate TEXT NOT NULL,
                status TEXT NOT NULL,
                FOREIGN KEY(userId) REFERENCES users(id),
                FOREIGN KEY(planId) REFERENCES insurance_plans(id)
            )
        `);

        await db.run(`
            CREATE TABLE IF NOT EXISTS discount_history (
                id TEXT PRIMARY KEY,
                userId TEXT NOT NULL,
                planId TEXT NOT NULL,
                discountType TEXT NOT NULL,
                amount REAL NOT NULL,
                reason TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                FOREIGN KEY(userId) REFERENCES users(id),
                FOREIGN KEY(planId) REFERENCES insurance_plans(id)
            )
        `);
    }

    static async createPlan(planData) {
        const { id, name, type, premium, coverage, features, maxDiscount } = planData;
        await db.run(
            `INSERT INTO insurance_plans (id, name, type, premium, coverage, features, max_discount)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [id, name, type, premium, coverage, JSON.stringify(features), maxDiscount]
        );
        return planData;
    }

    static async getPlan(planId) {
        const plan = await db.get(
            'SELECT * FROM insurance_plans WHERE id = ?',
            [planId]
        );
        if (plan) {
            plan.features = JSON.parse(plan.features);
        }
        return plan;
    }

    static async getAllPlans() {
        const plans = await db.all('SELECT * FROM insurance_plans');
        return plans.map(plan => ({
            ...plan,
            features: JSON.parse(plan.features)
        }));
    }

    static async enrollUser(enrollmentData) {
        const { id, userId, planId, startDate } = enrollmentData;
        await db.run(
            `INSERT INTO user_insurance (id, userId, planId, startDate, lastUpdateDate, status)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [id, userId, planId, startDate, startDate, 'ACTIVE']
        );
        return enrollmentData;
    }

    static async updateDiscount(userId, planId, newDiscount, reason) {
        await db.run(
            `UPDATE user_insurance 
             SET currentDiscount = ?, lastUpdateDate = ?
             WHERE userId = ? AND planId = ?`,
            [newDiscount, new Date().toISOString(), userId, planId]
        );

        await db.run(
            `INSERT INTO discount_history (id, userId, planId, discountType, amount, reason, timestamp)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                Math.random().toString(36).substr(2, 9),
                userId,
                planId,
                'UPDATE',
                newDiscount,
                reason,
                new Date().toISOString()
            ]
        );
    }

    static async getUserInsurance(userId) {
        const insurance = await db.get(
            `SELECT ui.*, ip.*
             FROM user_insurance ui
             JOIN insurance_plans ip ON ui.planId = ip.id
             WHERE ui.userId = ? AND ui.status = 'ACTIVE'`,
            [userId]
        );
        if (insurance) {
            insurance.features = JSON.parse(insurance.features);
        }
        return insurance;
    }

    static async calculateDiscount(userId) {
        try {
            // Get user's health score and activities
            const userStats = await db.get(
                `SELECT 
                    COALESCE((SELECT COUNT(*) FROM events WHERE user_id = ? AND event_type = 'exercise'), 0) as exerciseDays,
                    COALESCE((SELECT COUNT(*) FROM events WHERE user_id = ? AND event_type = 'checkup'), 0) as checkups,
                    COALESCE((SELECT AVG(CAST(json_extract(metadata, '$.score') AS INTEGER)) 
                     FROM events 
                     WHERE user_id = ? AND event_type = 'health_score'
                    ), 0) as avgHealthScore`,
                [userId, userId, userId]
            );

        let totalDiscount = 0;

        // Health score discount
        if (userStats.avgHealthScore >= 90) totalDiscount += 0.15;
        else if (userStats.avgHealthScore >= 80) totalDiscount += 0.12;
        else if (userStats.avgHealthScore >= 70) totalDiscount += 0.10;
        else if (userStats.avgHealthScore >= 60) totalDiscount += 0.07;

        // Exercise streak discount
        if (userStats.exerciseDays >= 180) totalDiscount += 0.08;
        else if (userStats.exerciseDays >= 90) totalDiscount += 0.05;
        else if (userStats.exerciseDays >= 30) totalDiscount += 0.02;

        // Checkup discount
        if (userStats.checkups > 0) totalDiscount += 0.03;

        return Math.min(totalDiscount, 0.30); // Cap at 30%
        } catch (error) {
            console.error('Error calculating discount:', error);
            return 0;
        }
    }
}

module.exports = Insurance;