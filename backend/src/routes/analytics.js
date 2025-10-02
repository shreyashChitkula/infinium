const express = require('express');
const auth = require('../middleware/auth');
const db = require('../config/database');

const router = express.Router();

// Get user's analytics
router.get('/user/:userId', auth, async (req, res) => {
    try {
        // Verify user is requesting their own analytics or has admin rights
        if (req.params.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view these analytics',
                errors: ['Can only view own analytics']
            });
        }

        // Get weekly progress
        const weeklyProgress = await db.all(
            `SELECT 
                date(timestamp) as date,
                COUNT(*) as total_actions,
                SUM(points_awarded) as points_earned,
                GROUP_CONCAT(DISTINCT event_type) as activities
             FROM events
             WHERE user_id = ?
             AND timestamp > datetime('now', '-7 days')
             GROUP BY date(timestamp)
             ORDER BY date`,
            [req.user.id]
        );

        // Get feature usage distribution
        const featureUsage = await db.all(
            `SELECT 
                event_type,
                COUNT(*) as usage_count,
                SUM(points_awarded) as total_points
             FROM events
             WHERE user_id = ?
             AND timestamp > datetime('now', '-30 days')
             GROUP BY event_type
             ORDER BY usage_count DESC`,
            [req.user.id]
        );

        // Get achievement progress
        const achievements = await db.all(
            `SELECT 
                a.id,
                a.name,
                a.description,
                a.points_required,
                CASE WHEN ua.id IS NOT NULL THEN 1 ELSE 0 END as achieved,
                ua.earned_at
             FROM achievements a
             LEFT JOIN user_achievements ua ON a.id = ua.achievement_id
                AND ua.user_id = ?
             ORDER BY a.points_required`,
            [req.user.id]
        );

        // Get challenge completion rate
        const challengeStats = await db.get(
            `SELECT 
                COUNT(*) as total_challenges,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_challenges,
                AVG(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) * 100 as completion_rate
             FROM challenges
             WHERE user_id = ?
             AND created_at > datetime('now', '-30 days')`,
            [req.user.id]
        );

        // Generate personalized recommendations
        const recommendations = [];
        
        // Check login streak
        const streakCheck = await db.get(
            `SELECT streak, last_streak_date
             FROM users
             WHERE id = ?`,
            [req.user.id]
        );
        
        if (!streakCheck.streak || streakCheck.streak < 3) {
            recommendations.push({
                type: 'streak',
                message: 'Log in daily to build your streak and earn bonus points!'
            });
        }

        // Check for unused features
        const unusedFeatures = await db.all(
            `SELECT event_type
             FROM (
                SELECT 'log_workout' as event_type
                UNION SELECT 'read_article'
                UNION SELECT 'view_policy'
                UNION SELECT 'invite_friend'
             ) all_types
             WHERE event_type NOT IN (
                SELECT DISTINCT event_type
                FROM events
                WHERE user_id = ?
                AND timestamp > datetime('now', '-30 days')
             )`,
            [req.user.id]
        );

        unusedFeatures.forEach(feature => {
            recommendations.push({
                type: 'feature_discovery',
                feature: feature.event_type,
                message: `Try ${feature.event_type.replace('_', ' ')} to earn points and unlock achievements!`
            });
        });

        res.json({
            success: true,
            data: {
                weeklyProgress: weeklyProgress.map(day => ({
                    date: day.date,
                    totalActions: day.total_actions,
                    pointsEarned: day.points_earned,
                    activities: day.activities.split(',')
                })),
                featureUsage: featureUsage.map(feature => ({
                    type: feature.event_type,
                    count: feature.usage_count,
                    points: feature.total_points
                })),
                achievements: achievements.map(achievement => ({
                    id: achievement.id,
                    name: achievement.name,
                    description: achievement.description,
                    pointsRequired: achievement.points_required,
                    achieved: achievement.achieved === 1,
                    earnedAt: achievement.earned_at
                })),
                challengeStats: {
                    total: challengeStats.total_challenges,
                    completed: challengeStats.completed_challenges,
                    completionRate: challengeStats.completion_rate
                },
                recommendations
            }
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching analytics',
            errors: [error.message]
        });
    }
});

// Get global platform analytics (admin only)
router.get('/platform', auth, async (req, res) => {
    try {
        // TODO: Add admin check here
        
        // Get daily active users
        const dau = await db.get(
            `SELECT COUNT(DISTINCT user_id) as count
             FROM events
             WHERE timestamp > datetime('now', '-1 day')`
        );

        // Get monthly active users
        const mau = await db.get(
            `SELECT COUNT(DISTINCT user_id) as count
             FROM events
             WHERE timestamp > datetime('now', '-30 days')`
        );

        // Get feature adoption rates
        const featureAdoption = await db.all(
            `SELECT 
                event_type,
                COUNT(DISTINCT user_id) as unique_users,
                COUNT(*) as total_uses
             FROM events
             WHERE timestamp > datetime('now', '-30 days')
             GROUP BY event_type
             ORDER BY unique_users DESC`
        );

        // Get premium conversion rate
        const premiumStats = await db.get(
            `SELECT 
                COUNT(*) as total_users,
                SUM(CASE WHEN unlocked_premium_discount = 1 THEN 1 ELSE 0 END) as premium_users
             FROM users`
        );

        res.json({
            success: true,
            data: {
                dau: dau.count,
                mau: mau.count,
                featureAdoption: featureAdoption.map(feature => ({
                    type: feature.event_type,
                    uniqueUsers: feature.unique_users,
                    totalUses: feature.total_uses,
                    adoptionRate: (feature.unique_users / premiumStats.total_users) * 100
                })),
                premiumConversion: {
                    totalUsers: premiumStats.total_users,
                    premiumUsers: premiumStats.premium_users,
                    conversionRate: (premiumStats.premium_users / premiumStats.total_users) * 100
                }
            }
        });
    } catch (error) {
        console.error('Error fetching platform analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching platform analytics',
            errors: [error.message]
        });
    }
});

module.exports = router;