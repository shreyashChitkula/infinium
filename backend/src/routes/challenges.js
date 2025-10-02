const express = require('express');
const { body, validationResult } = require('express-validator');
const Challenge = require('../models/Challenge');
const auth = require('../middleware/auth');

const router = express.Router();

// Get user's active challenges
router.get('/active', auth, async (req, res) => {
    try {
        const challenges = await Challenge.getUserActiveChallenges(req.user.id);
        
        res.json({
            success: true,
            data: {
                challenges: challenges.map(challenge => ({
                    ...challenge,
                    metadata: JSON.parse(challenge.metadata || '{}')
                }))
            }
        });
    } catch (error) {
        console.error('Error fetching active challenges:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching challenges',
            errors: [error.message]
        });
    }
});

// Get personalized challenge
router.get('/personalized', auth, async (req, res) => {
    try {
        const challenge = await Challenge.generatePersonalizedChallenge(req.user.id);
        
        res.json({
            success: true,
            data: {
                challenge: {
                    ...challenge,
                    metadata: JSON.parse(challenge.metadata || '{}')
                }
            }
        });
    } catch (error) {
        console.error('Error generating personalized challenge:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating challenge',
            errors: [error.message]
        });
    }
});

// Update challenge progress
router.post('/:challengeId/progress', auth, [
    body('increment').optional().isInt({ min: 1 }).toInt()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: errors.array()
            });
        }

        const challenge = await Challenge.findById(req.params.challengeId);
        
        // Verify challenge belongs to user
        if (challenge.user_id !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this challenge',
                errors: ['Challenge belongs to another user']
            });
        }

        const updatedChallenge = await Challenge.updateProgress(
            req.params.challengeId,
            req.body.increment || 1
        );

        res.json({
            success: true,
            data: {
                challenge: {
                    ...updatedChallenge,
                    metadata: JSON.parse(updatedChallenge.metadata || '{}')
                },
                completed: updatedChallenge.status === 'completed'
            }
        });
    } catch (error) {
        console.error('Error updating challenge progress:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating challenge progress',
            errors: [error.message]
        });
    }
});

module.exports = router;