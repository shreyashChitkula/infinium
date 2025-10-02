const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');

class Challenge {
    static TYPES = {
        WORKOUT_STREAK: 'workout_streak',
        ARTICLE_READER: 'article_reader',
        POLICY_EXPLORER: 'policy_explorer',
        SOCIAL_CONNECTOR: 'social_connector',
        FEATURE_DISCOVERER: 'feature_discoverer'
    };

    static async create(userId, type, options = {}) {
        const id = uuidv4();
        const {
            title,
            description,
            targetValue,
            category = 'general',
            difficulty = 'medium',
            rewardPoints = 50,
            durationDays = 7
        } = options;

        const endDate = new Date();
        endDate.setDate(endDate.getDate() + durationDays);

        await db.run(
            `INSERT INTO challenges (
                id, user_id, challenge_type, title, description,
                target_value, category, difficulty, reward_points,
                end_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id, userId, type, title, description,
                targetValue, category, difficulty, rewardPoints,
                endDate.toISOString()
            ]
        );

        return await this.findById(id);
    }

    static async updateProgress(id, increment = 1) {
        const challenge = await this.findById(id);
        if (!challenge) throw new Error('Challenge not found');

        const newProgress = challenge.current_progress + increment;
        const isCompleted = newProgress >= challenge.target_value;

        await db.run(
            `UPDATE challenges 
             SET current_progress = ?,
                 status = ?,
                 completed_at = ?
             WHERE id = ?`,
            [
                newProgress,
                isCompleted ? 'completed' : 'active',
                isCompleted ? new Date().toISOString() : null,
                id
            ]
        );

        return await this.findById(id);
    }

    static async findById(id) {
        return await db.get(
            'SELECT * FROM challenges WHERE id = ?',
            [id]
        );
    }

    static async getUserActiveChallenges(userId) {
        return await db.all(
            `SELECT * FROM challenges 
             WHERE user_id = ? 
             AND status = 'active'
             AND end_date > datetime('now')
             ORDER BY created_at DESC`,
            [userId]
        );
    }

    static async generatePersonalizedChallenge(userId) {
        // Get user's recent activity patterns
        const recentEvents = await db.all(
            `SELECT event_type, COUNT(*) as count 
             FROM events 
             WHERE user_id = ? 
             AND timestamp > datetime('now', '-30 days')
             GROUP BY event_type`,
            [userId]
        );

        // Find least used features
        const eventCounts = {};
        recentEvents.forEach(event => {
            eventCounts[event.event_type] = event.count;
        });

        // Generate challenge based on activity gaps
        let challengeType, title, description, targetValue;

        if (!eventCounts['log_workout'] || eventCounts['log_workout'] < 3) {
            challengeType = this.TYPES.WORKOUT_STREAK;
            title = 'Workout Warrior';
            description = 'Complete 3 workouts this week';
            targetValue = 3;
        } else if (!eventCounts['read_article'] || eventCounts['read_article'] < 5) {
            challengeType = this.TYPES.ARTICLE_READER;
            title = 'Knowledge Seeker';
            description = 'Read 5 wellness articles';
            targetValue = 5;
        } else if (!eventCounts['view_policy'] || eventCounts['view_policy'] < 2) {
            challengeType = this.TYPES.POLICY_EXPLORER;
            title = 'Insurance Explorer';
            description = 'View 2 different insurance policies';
            targetValue = 2;
        } else {
            challengeType = this.TYPES.FEATURE_DISCOVERER;
            title = 'Feature Explorer';
            description = 'Try 3 different features you haven\'t used before';
            targetValue = 3;
        }

        return await this.create(userId, challengeType, {
            title,
            description,
            targetValue,
            category: challengeType.split('_')[0],
            difficulty: 'medium',
            rewardPoints: 50,
            durationDays: 7
        });
    }
}

module.exports = Challenge;