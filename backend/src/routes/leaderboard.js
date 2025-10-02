const express = require('express');
const auth = require('../middleware/auth');
const db = require('../config/database');

const router = express.Router();

// Get global leaderboard
router.get('/', auth, async (req, res) => {
    try {
        const { period = 'weekly', limit = 50 } = req.query;

        let dateFilter;
        switch (period) {
            case 'weekly':
                dateFilter = "datetime('now', '-7 days')";
                break;
            case 'monthly':
                dateFilter = "datetime('now', '-30 days')";
                break;
            case 'alltime':
                dateFilter = "datetime('1970-01-01')";
                break;
            default:
                dateFilter = "datetime('now', '-7 days')";
        }

        const leaderboard = await db.all(
            `SELECT 
                u.id,
                u.username,
                u.level,
                u.avatar_url,
                u.badges,
                COALESCE(SUM(e.points_awarded), 0) as period_points,
                u.points as total_points
             FROM users u
             LEFT JOIN events e ON u.id = e.user_id 
                AND e.timestamp > ${dateFilter}
             GROUP BY u.id
             ORDER BY period_points DESC, u.points DESC
             LIMIT ?`,
            [limit]
        );

        // Get current user's rank
        const userRank = await db.get(
            `SELECT COUNT(*) + 1 as rank
             FROM (
                SELECT u.id, COALESCE(SUM(e.points_awarded), 0) as period_points
                FROM users u
                LEFT JOIN events e ON u.id = e.user_id 
                    AND e.timestamp > ${dateFilter}
                GROUP BY u.id
                HAVING period_points > (
                    SELECT COALESCE(SUM(e2.points_awarded), 0)
                    FROM events e2
                    WHERE e2.user_id = ?
                    AND e2.timestamp > ${dateFilter}
                )
             )`,
            [req.user.id]
        );

        res.json({
            success: true,
            data: {
                period,
                currentUserRank: userRank.rank,
                leaderboard: leaderboard.map(user => ({
                    id: user.id,
                    username: user.username,
                    level: user.level,
                    avatarUrl: user.avatar_url,
                    badges: JSON.parse(user.badges || '[]'),
                    periodPoints: user.period_points,
                    totalPoints: user.total_points,
                    isCurrentUser: user.id === req.user.id
                }))
            }
        });
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching leaderboard',
            errors: [error.message]
        });
    }
});

// Get user's rank and nearby users
router.get('/nearby', auth, async (req, res) => {
    try {
        const { range = 5 } = req.query;
        const { period = 'weekly' } = req.query;

        let dateFilter;
        switch (period) {
            case 'weekly':
                dateFilter = "datetime('now', '-7 days')";
                break;
            case 'monthly':
                dateFilter = "datetime('now', '-30 days')";
                break;
            case 'alltime':
                dateFilter = "datetime('1970-01-01')";
                break;
            default:
                dateFilter = "datetime('now', '-7 days')";
        }

        // Get users around current user's rank
        const nearbyUsers = await db.all(
            `WITH UserRanks AS (
                SELECT 
                    u.id,
                    u.username,
                    u.level,
                    u.avatar_url,
                    u.badges,
                    COALESCE(SUM(e.points_awarded), 0) as period_points,
                    u.points as total_points,
                    RANK() OVER (ORDER BY COALESCE(SUM(e.points_awarded), 0) DESC) as rank
                FROM users u
                LEFT JOIN events e ON u.id = e.user_id 
                    AND e.timestamp > ${dateFilter}
                GROUP BY u.id
            )
            SELECT *
            FROM UserRanks
            WHERE rank BETWEEN 
                (SELECT rank FROM UserRanks WHERE id = ?) - ?
                AND 
                (SELECT rank FROM UserRanks WHERE id = ?) + ?
            ORDER BY rank`,
            [req.user.id, range, req.user.id, range]
        );

        res.json({
            success: true,
            data: {
                period,
                users: nearbyUsers.map(user => ({
                    id: user.id,
                    username: user.username,
                    level: user.level,
                    avatarUrl: user.avatar_url,
                    badges: JSON.parse(user.badges || '[]'),
                    periodPoints: user.period_points,
                    totalPoints: user.total_points,
                    rank: user.rank,
                    isCurrentUser: user.id === req.user.id
                }))
            }
        });
    } catch (error) {
        console.error('Error fetching nearby ranks:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching nearby ranks',
            errors: [error.message]
        });
    }
});

module.exports = router;