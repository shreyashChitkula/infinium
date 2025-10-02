const express = require('express');
const router = express.Router();
const Insurance = require('../models/Insurance');
const auth = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// Initialize insurance tables
Insurance.initialize().catch(console.error);

// Get all available insurance plans
router.get('/plans', auth, async (req, res) => {
    try {
        const plans = await Insurance.getAllPlans();
        res.json({
            success: true,
            data: { plans }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to fetch insurance plans'
            }
        });
    }
});

// Get specific plan details
router.get('/plans/:planId', auth, async (req, res) => {
    try {
        const plan = await Insurance.getPlan(req.params.planId);
        if (!plan) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Insurance plan not found'
                }
            });
        }
        res.json({
            success: true,
            data: { plan }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to fetch insurance plan'
            }
        });
    }
});

// Enroll in an insurance plan
router.post('/enroll', auth, async (req, res) => {
    try {
        const { planId } = req.body;
        const userId = req.user.id;

        // Check if plan exists
        const plan = await Insurance.getPlan(planId);
        if (!plan) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Insurance plan not found'
                }
            });
        }

        // Check if user already has active insurance
        const existingInsurance = await Insurance.getUserInsurance(userId);
        if (existingInsurance) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'ALREADY_ENROLLED',
                    message: 'User already has active insurance'
                }
            });
        }

        // Calculate initial discount
        const initialDiscount = await Insurance.calculateDiscount(userId);

        // Create enrollment
        const enrollment = await Insurance.enrollUser({
            id: uuidv4(),
            userId,
            planId,
            startDate: new Date().toISOString()
        });

        // Update initial discount
        await Insurance.updateDiscount(
            userId,
            planId,
            initialDiscount,
            'Initial enrollment discount'
        );

        res.json({
            success: true,
            data: {
                enrollment,
                initialDiscount
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to enroll in insurance plan'
            }
        });
    }
});

// Get user's current insurance details
router.get('/current', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const insurance = await Insurance.getUserInsurance(userId);
        
        if (!insurance) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'No active insurance found'
                }
            });
        }

        const currentDiscount = await Insurance.calculateDiscount(userId);

        res.json({
            success: true,
            data: {
                insurance,
                currentDiscount
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to fetch insurance details'
            }
        });
    }
});

// Calculate potential discounts
router.get('/calculate-discount', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const discount = await Insurance.calculateDiscount(userId);
        
        res.json({
            success: true,
            data: {
                discount,
                discountPercentage: `${(discount * 100).toFixed(1)}%`
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to calculate discount'
            }
        });
    }
});

module.exports = router;